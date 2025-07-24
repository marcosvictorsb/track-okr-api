import { Request, Response } from 'express';
import { SubscriptionPaymentRepository } from '@domains/api/subscription-payments/repository/subscription-payment.repository';
import { efiPayService } from '@adapters/services/efi-pay.service';

export class BackofficePaymentsController {
  private repository: SubscriptionPaymentRepository;

  constructor() {
    this.repository = new SubscriptionPaymentRepository();
  }

  /**
   * GET /backoffice/payments
   * Lista pagamentos com filtros
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { company_id, subscription_id, status } = req.query;
      let payments;

      if (company_id) {
        payments = await this.repository.findByCompanyId(Number(company_id));
      } else if (subscription_id) {
        payments = await this.repository.findBySubscriptionId(
          Number(subscription_id)
        );
      } else {
        // Para uma implementação completa, adicionar método findAll no repository
        payments = await this.repository.findPendingPayments();
      }

      // Filtrar por status se especificado
      if (status && typeof status === 'string') {
        payments = payments.filter((p) => p.status === status);
      }

      res.json({
        success: true,
        data: payments,
        count: payments.length
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({
        success: false,
        message: 'Erro ao listar pagamentos',
        error: errorMessage
      });
    }
  }

  /**
   * GET /backoffice/payments/pending
   * Lista pagamentos pendentes
   */
  async listPending(req: Request, res: Response): Promise<void> {
    try {
      const payments = await this.repository.findPendingPayments();

      res.json({
        success: true,
        data: payments,
        count: payments.length
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({
        success: false,
        message: 'Erro ao listar pagamentos pendentes',
        error: errorMessage
      });
    }
  }

  /**
   * GET /backoffice/payments/overdue
   * Lista pagamentos em atraso
   */
  async listOverdue(req: Request, res: Response): Promise<void> {
    try {
      const payments = await this.repository.findOverduePayments();

      res.json({
        success: true,
        data: payments,
        count: payments.length
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({
        success: false,
        message: 'Erro ao listar pagamentos em atraso',
        error: errorMessage
      });
    }
  }

  /**
   * GET /backoffice/payments/:id
   * Busca um pagamento específico
   */
  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payment = await this.repository.findById(Number(id));

      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'Pagamento não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: payment
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar pagamento',
        error: errorMessage
      });
    }
  }

  /**
   * POST /backoffice/payments/:id/sync-efi
   * Sincroniza status do pagamento com a Efí Pay
   */
  async syncWithEfi(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payment = await this.repository.findById(Number(id));

      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'Pagamento não encontrado'
        });
        return;
      }

      if (!payment.efi_charge_id) {
        res.status(400).json({
          success: false,
          message: 'Pagamento não possui ID da Efí Pay'
        });
        return;
      }

      const efiCharge = await efiPayService.getCharge(payment.efi_charge_id);

      // Mapear status da Efí para nosso sistema
      let newStatus = payment.status;
      if (efiCharge.data.status === 'paid') {
        newStatus = 'paid';
      } else if (efiCharge.data.status === 'cancelled') {
        newStatus = 'cancelled';
      } else if (efiCharge.data.status === 'unpaid') {
        newStatus = 'pending';
      }

      const updatedPayment = await this.repository.update(Number(id), {
        status: newStatus,
        webhook_data: efiCharge.data,
        paid_at: efiCharge.data.paid_at
          ? new Date(efiCharge.data.paid_at)
          : undefined
      });

      res.json({
        success: true,
        message: 'Pagamento sincronizado com sucesso',
        data: {
          payment: updatedPayment,
          efi_data: efiCharge.data
        }
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({
        success: false,
        message: 'Erro ao sincronizar pagamento',
        error: errorMessage
      });
    }
  }

  /**
   * POST /backoffice/payments/sync-all-pending
   * Sincroniza todos os pagamentos pendentes
   */
  async syncAllPending(req: Request, res: Response): Promise<void> {
    try {
      const pendingPayments = await this.repository.findPendingPayments();
      const results: Array<{
        payment_id: number;
        old_status?: string;
        new_status?: string;
        success: boolean;
        error?: string;
      }> = [];

      for (const payment of pendingPayments) {
        if (payment.efi_charge_id) {
          try {
            const efiCharge = await efiPayService.getCharge(
              payment.efi_charge_id
            );

            let newStatus = payment.status;
            if (efiCharge.data.status === 'paid') {
              newStatus = 'paid';
            } else if (efiCharge.data.status === 'cancelled') {
              newStatus = 'cancelled';
            }

            if (newStatus !== payment.status) {
              await this.repository.update(payment.id, {
                status: newStatus,
                webhook_data: efiCharge.data,
                paid_at: efiCharge.data.paid_at
                  ? new Date(efiCharge.data.paid_at)
                  : undefined
              });
            }

            results.push({
              payment_id: payment.id,
              old_status: payment.status,
              new_status: newStatus,
              success: true
            });
          } catch (error) {
            results.push({
              payment_id: payment.id,
              success: false,
              error:
                error instanceof Error ? error.message : 'Erro desconhecido'
            });
          }
        }
      }

      res.json({
        success: true,
        message: 'Sincronização em lote concluída',
        data: {
          total_processed: results.length,
          successful: results.filter((r) => r.success).length,
          failed: results.filter((r) => !r.success).length,
          details: results
        }
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({
        success: false,
        message: 'Erro na sincronização em lote',
        error: errorMessage
      });
    }
  }

  /**
   * GET /backoffice/payments/stats
   * Estatísticas de pagamentos
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const allPending = await this.repository.findPendingPayments();
      const allOverdue = await this.repository.findOverduePayments();

      // Para uma implementação completa, criar métodos específicos no repository
      const stats = {
        pending_count: allPending.length,
        overdue_count: allOverdue.length,
        pending_amount: allPending.reduce(
          (sum, p) => sum + Number(p.amount),
          0
        ),
        overdue_amount: allOverdue.reduce(
          (sum, p) => sum + Number(p.amount),
          0
        ),
        last_updated: new Date().toISOString()
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({
        success: false,
        message: 'Erro ao gerar estatísticas',
        error: errorMessage
      });
    }
  }
}
