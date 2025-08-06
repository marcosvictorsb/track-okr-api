import { Request, Response } from 'express';
import { EfiPayService } from '@adapters/services/efi-pay.service';
import { SubscriptionPaymentRepository } from '@domains/api/subscription-payments/repository/subscription-payment.repository';
import {
  ProcessPaymentWebhookUseCase,
  EfiWebhookData
} from '@domains/api/subscription-payments/usecases/subscription-payment.usecases';
import { SubscriptionRepository } from '@domains/api/subscriptions/repository/subscription.repository';
import { ProcessSubscriptionWebhookUseCase } from '@domains/api/subscriptions/usecases/subscription.usecases';
import SubscriptionModel from '@domains/api/subscriptions/model/subscription.model';

export class EfiWebhookController {
  private paymentRepository: SubscriptionPaymentRepository;
  private subscriptionRepository: SubscriptionRepository;
  private processPaymentWebhookUseCase: ProcessPaymentWebhookUseCase;
  private processSubscriptionWebhookUseCase: ProcessSubscriptionWebhookUseCase;

  constructor() {
    this.paymentRepository = new SubscriptionPaymentRepository();
    this.subscriptionRepository = new SubscriptionRepository({
      model: SubscriptionModel
    });
    this.processPaymentWebhookUseCase = new ProcessPaymentWebhookUseCase(
      this.paymentRepository
    );
    this.processSubscriptionWebhookUseCase =
      new ProcessSubscriptionWebhookUseCase(this.subscriptionRepository);
  }

  /**
   * POST /webhook/efi-pay
   * Processa webhooks da Efí Pay
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['x-efi-signature'] as string;
      const webhookSecret = process.env.EFI_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.error('EFI_WEBHOOK_SECRET não configurado');
        res.status(500).json({ error: 'Configuração de webhook inválida' });
        return;
      }

      // Verificar assinatura do webhook
      const rawBody = JSON.stringify(req.body);
      if (!EfiPayService.verifyWebhook(rawBody, signature, webhookSecret)) {
        console.warn('Webhook com assinatura inválida');
        res.status(401).json({ error: 'Assinatura inválida' });
        return;
      }

      const webhookData: EfiWebhookData = req.body;
      console.log('Webhook Efí Pay recebido:', webhookData);

      // Processar diferentes tipos de eventos usando use cases
      if (webhookData.evento.startsWith('cobranca_')) {
        await this.processPaymentWebhookUseCase.execute(webhookData);
      } else if (webhookData.evento.startsWith('assinatura_')) {
        await this.processSubscriptionWebhookUseCase.execute(webhookData);
      } else {
        console.log(`Evento não tratado: ${webhookData.evento}`);
      }

      res.status(200).json({ status: 'processed' });
    } catch (error) {
      console.error('Erro no webhook Efí Pay:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
