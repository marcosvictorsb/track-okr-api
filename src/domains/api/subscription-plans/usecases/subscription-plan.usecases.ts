import { SubscriptionPlanRepository } from '../repository/subscription-plan.repository';
import { efiPayService, EfiPlanData } from '@adapters/services/efi-pay.service';
import {
  SubscriptionPlanModel,
  SubscriptionPlanCreationAttributes
} from '@infra/database/models/subscription-plan.model';

export interface CreatePlanRequest {
  name: string;
  description?: string;
  max_users: number;
  price_monthly: number;
  price_yearly?: number;
  features: object;
  efi_plan_id?: string;
  create_efi_plan?: boolean;
}

export class CreateSubscriptionPlanUseCase {
  constructor(private subscriptionPlanRepository: SubscriptionPlanRepository) {}

  async execute(request: CreatePlanRequest): Promise<SubscriptionPlanModel> {
    let efiPlanId: string | undefined;

    // Se solicitado, criar o plano na Efí Pay
    if (request.create_efi_plan) {
      try {
        const efiPlanData: EfiPlanData = {
          name: request.name,
          interval: 30, // Mensal
          repeats: 0, // Indefinido
          value: Math.round(request.price_monthly * 100), // Converter para centavos
          metadata: {
            custom_id: `plan_${Date.now()}`,
            notification_url: process.env.EFI_WEBHOOK_URL
          }
        };

        const efiResponse = await efiPayService.createPlan(efiPlanData);
        efiPlanId = efiResponse.data.plan_id;
      } catch (error) {
        console.error('Erro ao criar plano na Efí Pay:', error);
        throw new Error('Falha ao criar plano na Efí Pay');
      }
    }

    // Criar o plano no banco de dados
    const planData: SubscriptionPlanCreationAttributes = {
      name: request.name,
      description: request.description,
      max_users: request.max_users,
      price_monthly: request.price_monthly,
      price_yearly: request.price_yearly,
      features: request.features,
      efi_plan_id: efiPlanId,
      is_active: true
    };

    return await this.subscriptionPlanRepository.create(planData);
  }
}

export class ListSubscriptionPlansUseCase {
  constructor(private subscriptionPlanRepository: SubscriptionPlanRepository) {}

  async execute(onlyActive: boolean = true): Promise<SubscriptionPlanModel[]> {
    return await this.subscriptionPlanRepository.findAll(onlyActive);
  }
}

export class GetSubscriptionPlanUseCase {
  constructor(private subscriptionPlanRepository: SubscriptionPlanRepository) {}

  async execute(id: number): Promise<SubscriptionPlanModel | null> {
    return await this.subscriptionPlanRepository.findById(id);
  }
}

export class UpdateSubscriptionPlanUseCase {
  constructor(private subscriptionPlanRepository: SubscriptionPlanRepository) {}

  async execute(
    id: number,
    updateData: Partial<CreatePlanRequest>
  ): Promise<SubscriptionPlanModel | null> {
    const plan = await this.subscriptionPlanRepository.findById(id);
    if (!plan) {
      return null;
    }

    return await this.subscriptionPlanRepository.update(id, updateData);
  }
}

export class DeleteSubscriptionPlanUseCase {
  constructor(private subscriptionPlanRepository: SubscriptionPlanRepository) {}

  async execute(id: number): Promise<boolean> {
    const plan = await this.subscriptionPlanRepository.findById(id);
    if (!plan) {
      return false;
    }

    // Desativar ao invés de deletar para manter histórico
    await this.subscriptionPlanRepository.update(id, { is_active: false });
    return true;
  }
}
