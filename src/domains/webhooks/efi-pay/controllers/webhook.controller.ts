import { Request, Response } from 'express';
import { EfiPayService } from '@adapters/services/efi-pay.service';
import { SubscriptionPaymentRepository } from '@domains/api/subscription-payments/repository/subscription-payment.repository';

export class EfiWebhookController {
  private paymentRepository: SubscriptionPaymentRepository;

  constructor() {
    this.paymentRepository = new SubscriptionPaymentRepository();
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

      const webhookData = req.body;
      console.log('Webhook Efí Pay recebido:', webhookData);

      // Processar diferentes tipos de eventos
      switch (webhookData.evento) {
        case 'cobranca_paga':
          await this.handlePaymentPaid(webhookData);
          break;

        case 'cobranca_vencida':
          await this.handlePaymentOverdue(webhookData);
          break;

        case 'cobranca_cancelada':
          await this.handlePaymentCancelled(webhookData);
          break;

        case 'assinatura_cancelada':
          await this.handleSubscriptionCancelled(webhookData);
          break;

        case 'assinatura_suspensa':
          await this.handleSubscriptionSuspended(webhookData);
          break;

        default:
          console.log(`Evento não tratado: ${webhookData.evento}`);
      }

      res.status(200).json({ status: 'processed' });
    } catch (error) {
      console.error('Erro no webhook Efí Pay:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  private async handlePaymentPaid(webhookData: any): Promise<void> {
    try {
      const chargeId = webhookData.data?.charge_id;
      if (!chargeId) return;

      const payment = await this.paymentRepository.findByEfiChargeId(chargeId);
      if (!payment) {
        console.warn(`Pagamento não encontrado para charge_id: ${chargeId}`);
        return;
      }

      await this.paymentRepository.update(payment.id, {
        status: 'paid',
        paid_at: new Date(),
        webhook_data: webhookData
      });

      console.log(`Pagamento ${payment.id} marcado como pago`);
    } catch (error) {
      console.error('Erro ao processar pagamento pago:', error);
    }
  }

  private async handlePaymentOverdue(webhookData: any): Promise<void> {
    try {
      const chargeId = webhookData.data?.charge_id;
      if (!chargeId) return;

      const payment = await this.paymentRepository.findByEfiChargeId(chargeId);
      if (!payment) {
        console.warn(`Pagamento não encontrado para charge_id: ${chargeId}`);
        return;
      }

      await this.paymentRepository.update(payment.id, {
        status: 'overdue',
        webhook_data: webhookData
      });

      console.log(`Pagamento ${payment.id} marcado como vencido`);
    } catch (error) {
      console.error('Erro ao processar pagamento vencido:', error);
    }
  }

  private async handlePaymentCancelled(webhookData: any): Promise<void> {
    try {
      const chargeId = webhookData.data?.charge_id;
      if (!chargeId) return;

      const payment = await this.paymentRepository.findByEfiChargeId(chargeId);
      if (!payment) {
        console.warn(`Pagamento não encontrado para charge_id: ${chargeId}`);
        return;
      }

      await this.paymentRepository.update(payment.id, {
        status: 'cancelled',
        webhook_data: webhookData
      });

      console.log(`Pagamento ${payment.id} cancelado`);
    } catch (error) {
      console.error('Erro ao processar cancelamento de pagamento:', error);
    }
  }

  private async handleSubscriptionCancelled(webhookData: any): Promise<void> {
    try {
      const subscriptionId = webhookData.data?.subscription_id;
      console.log(`Assinatura ${subscriptionId} cancelada na Efí Pay`);

      // Aqui você implementaria a lógica para cancelar a assinatura local
      // Buscar pela subscription que tem o efi_subscription_id correspondente
      // e atualizar o status para 'cancelled'
    } catch (error) {
      console.error('Erro ao processar cancelamento de assinatura:', error);
    }
  }

  private async handleSubscriptionSuspended(webhookData: any): Promise<void> {
    try {
      const subscriptionId = webhookData.data?.subscription_id;
      console.log(`Assinatura ${subscriptionId} suspensa na Efí Pay`);

      // Implementar lógica para suspender assinatura local
    } catch (error) {
      console.error('Erro ao processar suspensão de assinatura:', error);
    }
  }
}
