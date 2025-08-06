import { SubscriptionRepository } from '../repository/subscription.repository';
import { SubscriptionPlanRepository } from '@domains/api/subscription-plans/repository/subscription-plan.repository';
import {
  efiPayService,
  EfiSubscriptionData
} from '@adapters/services/efi-pay.service';
import { SubscriptionEntity } from '../entity/subscription.entity';
import {
  CreateSubscriptionCriteria,
  FindSubscriptionCriteria,
  UpdateSubscriptionCriteria,
  SubscriptionStatus
} from '../interfaces/default.interfaces';

export interface CreateSubscriptionRequest {
  company_id: number;
  subscription_plan_id: number;
  amount_users: number;
  customer_data: {
    name: string;
    email: string;
    cpf: string;
    birth: string;
    phone_number: string;
  };
  payment_method: 'credit_card' | 'banking_billet';
  credit_card_token?: string;
}

export class CreateSubscriptionUseCase {
  constructor(
    private subscriptionRepository: SubscriptionRepository,
    private subscriptionPlanRepository: SubscriptionPlanRepository
  ) {}

  async execute(
    request: CreateSubscriptionRequest
  ): Promise<SubscriptionEntity> {
    // Buscar o plano
    const plan = await this.subscriptionPlanRepository.findById(
      request.subscription_plan_id
    );
    if (!plan) {
      throw new Error('Plano de assinatura não encontrado');
    }

    if (!plan.efi_plan_id) {
      throw new Error('Plano não está sincronizado com a EFI Pay');
    }

    // Verificar se a empresa já tem uma assinatura ativa
    const existingSubscription = await this.subscriptionRepository.find({
      id_company: request.company_id,
      status: SubscriptionStatus.ACTIVE
    });

    if (existingSubscription) {
      throw new Error('Empresa já possui uma assinatura ativa');
    }

    try {
      // Criar assinatura na EFI Pay
      const efiSubscriptionData: EfiSubscriptionData = {
        plan_id: plan.efi_plan_id,
        items: [
          {
            name: plan.name,
            amount: 1,
            value: Math.round(plan.price_monthly * 100) // converter para centavos
          }
        ],
        customer: request.customer_data,
        payment_method: request.payment_method,
        metadata: {
          custom_id: `company_${request.company_id}`,
          notification_url: `${process.env.APP_URL}/webhook/efi-pay`
        }
      };

      const efiResponse =
        await efiPayService.createSubscription(efiSubscriptionData);

      // Criar registro local
      const subscriptionData: CreateSubscriptionCriteria = {
        id_company: request.company_id,
        subscription_plan_id: request.subscription_plan_id,
        amount_users: request.amount_users,
        status: SubscriptionStatus.ACTIVE,
        id_external_payment: efiResponse.data.subscription_id
      };

      return await this.subscriptionRepository.create(subscriptionData);
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      throw new Error('Falha ao criar assinatura');
    }
  }
}

export class GetSubscriptionUseCase {
  constructor(private subscriptionRepository: SubscriptionRepository) {}

  async execute(
    criteria: FindSubscriptionCriteria
  ): Promise<SubscriptionEntity | undefined> {
    return await this.subscriptionRepository.find(criteria);
  }

  async executeByCompany(
    companyId: number
  ): Promise<SubscriptionEntity | undefined> {
    return await this.subscriptionRepository.find({
      id_company: companyId,
      status: SubscriptionStatus.ACTIVE
    });
  }
}

export class UpdateSubscriptionUseCase {
  constructor(private subscriptionRepository: SubscriptionRepository) {}

  async execute(
    criteria: UpdateSubscriptionCriteria,
    updateData: Partial<SubscriptionEntity>
  ): Promise<boolean> {
    return await this.subscriptionRepository.update(criteria, updateData);
  }

  async cancelSubscription(subscriptionId: number): Promise<boolean> {
    try {
      // Buscar a assinatura
      const subscription = await this.subscriptionRepository.find({
        id: subscriptionId
      });

      if (!subscription) {
        throw new Error('Assinatura não encontrada');
      }

      if (subscription.id_external_payment) {
        // Cancelar na EFI Pay
        await efiPayService.cancelSubscription(
          subscription.id_external_payment
        );
      }

      // Atualizar status local
      return await this.subscriptionRepository.update(
        { id: subscriptionId },
        { status: SubscriptionStatus.CANCELLED }
      );
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      throw new Error('Falha ao cancelar assinatura');
    }
  }
}

export class UpgradeSubscriptionUseCase {
  constructor(
    private subscriptionRepository: SubscriptionRepository,
    private subscriptionPlanRepository: SubscriptionPlanRepository
  ) {}

  async execute(
    subscriptionId: number,
    newPlanId: number
  ): Promise<SubscriptionEntity | undefined> {
    try {
      // Buscar assinatura atual
      const subscription = await this.subscriptionRepository.find({
        id: subscriptionId
      });

      if (!subscription) {
        throw new Error('Assinatura não encontrada');
      }

      // Buscar novo plano
      const newPlan = await this.subscriptionPlanRepository.findById(newPlanId);
      if (!newPlan) {
        throw new Error('Plano não encontrado');
      }

      // Atualizar a assinatura
      const updated = await this.subscriptionRepository.update(
        { id: subscriptionId },
        { subscription_plan_id: newPlanId }
      );

      if (updated) {
        return await this.subscriptionRepository.find({ id: subscriptionId });
      }

      return undefined;
    } catch (error) {
      console.error('Erro ao fazer upgrade da assinatura:', error);
      throw new Error('Falha ao fazer upgrade da assinatura');
    }
  }
}

export class ProcessSubscriptionWebhookUseCase {
  constructor(private subscriptionRepository: SubscriptionRepository) {}

  async execute(webhookData: {
    evento: string;
    data: { subscription_id?: string; [key: string]: unknown };
  }): Promise<void> {
    const efiSubscriptionId = webhookData.data?.subscription_id;
    if (!efiSubscriptionId) return;

    const subscription = await this.subscriptionRepository.find({
      id_external_payment: efiSubscriptionId
    });

    if (!subscription) {
      console.warn(
        `Assinatura não encontrada para subscription_id: ${efiSubscriptionId}`
      );
      return;
    }

    let newStatus: SubscriptionStatus | undefined;

    switch (webhookData.evento) {
      case 'assinatura_cancelada':
        newStatus = SubscriptionStatus.CANCELLED;
        break;

      case 'assinatura_suspensa':
        newStatus = SubscriptionStatus.CANCELLED; // Tratar suspensão como cancelamento
        break;

      case 'assinatura_ativada':
        newStatus = SubscriptionStatus.ACTIVE;
        break;

      default:
        console.log(`Evento de assinatura não tratado: ${webhookData.evento}`);
        return;
    }

    if (newStatus && subscription.id) {
      await this.subscriptionRepository.update(
        { id: subscription.id },
        { status: newStatus }
      );
      console.log(
        `Assinatura ${subscription.id} atualizada para: ${newStatus}`
      );
    }
  }
}
