import { SubscriptionPaymentRepository } from '../repository/subscription-payment.repository';
import {
  efiPayService,
  EfiChargeData
} from '@adapters/services/efi-pay.service';
import {
  SubscriptionPaymentModel,
  SubscriptionPaymentCreationAttributes,
  SubscriptionPaymentAttributes
} from '../model/subscription-payment.model';

export interface CreateSubscriptionPaymentRequest {
  subscription_id: number;
  company_id: number;
  amount: number;
  payment_method: 'credit_card' | 'banking_billet' | 'pix';
  due_date?: Date;
  description?: string;
  customer_data: {
    name: string;
    email: string;
    cpf: string;
    birth: string;
    phone_number: string;
  };
  credit_card_data?: {
    payment_token: string;
    installments: number;
    billing_address: {
      street: string;
      number: string;
      neighborhood: string;
      zipcode: string;
      city: string;
      state: string;
    };
  };
}

export class CreateSubscriptionPaymentUseCase {
  constructor(
    private subscriptionPaymentRepository: SubscriptionPaymentRepository
  ) {}

  async execute(
    request: CreateSubscriptionPaymentRequest
  ): Promise<SubscriptionPaymentModel> {
    // Criar cobrança na EFI Pay
    const chargeData: EfiChargeData = {
      items: [
        {
          name: request.description || 'Assinatura Track OKR',
          amount: 1,
          value: Math.round(request.amount * 100) // converter para centavos
        }
      ],
      payment: {
        method: request.payment_method
      },
      metadata: {
        custom_id: `subscription_${request.subscription_id}`,
        notification_url: `${process.env.APP_URL}/webhook/efi-pay`
      }
    };

    // Configurar dados específicos do método de pagamento
    if (request.payment_method === 'credit_card' && request.credit_card_data) {
      chargeData.payment.credit_card = {
        installments: request.credit_card_data.installments,
        billing_address: request.credit_card_data.billing_address,
        payment_token: request.credit_card_data.payment_token,
        customer: request.customer_data
      };
    } else if (request.payment_method === 'banking_billet') {
      chargeData.payment.banking_billet = {
        expire_at:
          request.due_date?.toISOString() ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
        customer: request.customer_data
      };
    }

    try {
      const efiResponse = await efiPayService.createCharge(chargeData);

      // Criar registro local
      const paymentData: SubscriptionPaymentCreationAttributes = {
        subscription_id: request.subscription_id,
        company_id: request.company_id,
        efi_charge_id: efiResponse.data.charge_id,
        amount: request.amount,
        status: 'pending',
        payment_method: request.payment_method,
        due_date: request.due_date,
        description: request.description,
        payment_link:
          efiResponse.data.payment?.banking_billet?.link ||
          efiResponse.data.payment?.pix?.qr_code
      };

      return await this.subscriptionPaymentRepository.create(paymentData);
    } catch (error) {
      console.error('Erro ao criar pagamento de assinatura:', error);
      throw new Error('Falha ao processar pagamento');
    }
  }
}

export class GetSubscriptionPaymentUseCase {
  constructor(
    private subscriptionPaymentRepository: SubscriptionPaymentRepository
  ) {}

  async execute(paymentId: number): Promise<SubscriptionPaymentModel | null> {
    return await this.subscriptionPaymentRepository.findById(paymentId);
  }
}

export class ListSubscriptionPaymentsUseCase {
  constructor(
    private subscriptionPaymentRepository: SubscriptionPaymentRepository
  ) {}

  async executeBySubscription(
    subscriptionId: number
  ): Promise<SubscriptionPaymentModel[]> {
    return await this.subscriptionPaymentRepository.findBySubscriptionId(
      subscriptionId
    );
  }

  async executeByCompany(
    companyId: number
  ): Promise<SubscriptionPaymentModel[]> {
    return await this.subscriptionPaymentRepository.findByCompanyId(companyId);
  }

  async executePendingPayments(): Promise<SubscriptionPaymentModel[]> {
    return await this.subscriptionPaymentRepository.findPendingPayments();
  }

  async executeOverduePayments(): Promise<SubscriptionPaymentModel[]> {
    return await this.subscriptionPaymentRepository.findOverduePayments();
  }
}

export class UpdateSubscriptionPaymentUseCase {
  constructor(
    private subscriptionPaymentRepository: SubscriptionPaymentRepository
  ) {}

  async execute(
    paymentId: number,
    updateData: Partial<SubscriptionPaymentAttributes>
  ): Promise<SubscriptionPaymentModel | null> {
    return await this.subscriptionPaymentRepository.update(
      paymentId,
      updateData
    );
  }

  async executeByEfiChargeId(
    efiChargeId: string,
    updateData: Partial<SubscriptionPaymentAttributes>
  ): Promise<SubscriptionPaymentModel | null> {
    return await this.subscriptionPaymentRepository.updateByEfiChargeId(
      efiChargeId,
      updateData
    );
  }
}

export interface EfiWebhookData {
  evento: string;
  data: {
    charge_id?: string;
    subscription_id?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export class ProcessPaymentWebhookUseCase {
  constructor(
    private subscriptionPaymentRepository: SubscriptionPaymentRepository
  ) {}

  async execute(webhookData: EfiWebhookData): Promise<void> {
    const chargeId = webhookData.data?.charge_id;
    if (!chargeId) return;

    const payment =
      await this.subscriptionPaymentRepository.findByEfiChargeId(chargeId);
    if (!payment) {
      console.warn(`Pagamento não encontrado para charge_id: ${chargeId}`);
      return;
    }

    const updateData: Partial<SubscriptionPaymentAttributes> = {
      webhook_data: webhookData
    };

    switch (webhookData.evento) {
      case 'cobranca_paga':
        updateData.status = 'paid';
        updateData.paid_at = new Date();
        break;

      case 'cobranca_vencida':
        updateData.status = 'overdue';
        break;

      case 'cobranca_cancelada':
        updateData.status = 'cancelled';
        break;

      case 'cobranca_contestada':
        updateData.status = 'failed';
        break;

      default:
        console.log(`Evento não tratado: ${webhookData.evento}`);
        return;
    }

    await this.subscriptionPaymentRepository.update(payment.id, updateData);
    console.log(`Pagamento ${payment.id} atualizado: ${updateData.status}`);
  }
}
