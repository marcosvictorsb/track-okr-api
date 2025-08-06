import { Request, Response } from 'express';
import {
  CreateSubscriptionPaymentUseCase,
  GetSubscriptionPaymentUseCase,
  ListSubscriptionPaymentsUseCase,
  UpdateSubscriptionPaymentUseCase,
  CreateSubscriptionPaymentRequest
} from '../usecases/subscription-payment.usecases';
import { SubscriptionPaymentRepository } from '../repository/subscription-payment.repository';

export class SubscriptionPaymentController {
  private createUseCase: CreateSubscriptionPaymentUseCase;
  private getUseCase: GetSubscriptionPaymentUseCase;
  private listUseCase: ListSubscriptionPaymentsUseCase;
  private updateUseCase: UpdateSubscriptionPaymentUseCase;
  private repository: SubscriptionPaymentRepository;

  constructor() {
    this.repository = new SubscriptionPaymentRepository();
    this.createUseCase = new CreateSubscriptionPaymentUseCase(this.repository);
    this.getUseCase = new GetSubscriptionPaymentUseCase(this.repository);
    this.listUseCase = new ListSubscriptionPaymentsUseCase(this.repository);
    this.updateUseCase = new UpdateSubscriptionPaymentUseCase(this.repository);
  }

  /**
   * POST /api/subscription-payments
   * Cria um novo pagamento de assinatura
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const paymentRequest: CreateSubscriptionPaymentRequest = req.body;

      const payment = await this.createUseCase.execute(paymentRequest);

      res.status(201).json({
        success: true,
        message: 'Pagamento criado com sucesso',
        data: payment
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(400).json({
        success: false,
        message: 'Erro ao criar pagamento',
        error: errorMessage
      });
    }
  }

  /**
   * GET /api/subscription-payments/:id
   * Busca um pagamento específico
   */
  async get(req: Request, res: Response): Promise<void> {
    try {
      const paymentId = parseInt(req.params.id);

      if (isNaN(paymentId)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
        return;
      }

      const payment = await this.getUseCase.execute(paymentId);

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
   * GET /api/subscription-payments/subscription/:subscriptionId
   * Lista pagamentos de uma assinatura
   */
  async listBySubscription(req: Request, res: Response): Promise<void> {
    try {
      const subscriptionId = parseInt(req.params.subscriptionId);

      if (isNaN(subscriptionId)) {
        res.status(400).json({
          success: false,
          message: 'ID da assinatura inválido'
        });
        return;
      }

      const payments =
        await this.listUseCase.executeBySubscription(subscriptionId);

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
   * GET /api/subscription-payments/company/:companyId
   * Lista pagamentos de uma empresa
   */
  async listByCompany(req: Request, res: Response): Promise<void> {
    try {
      const companyId = parseInt(req.params.companyId);

      if (isNaN(companyId)) {
        res.status(400).json({
          success: false,
          message: 'ID da empresa inválido'
        });
        return;
      }

      const payments = await this.listUseCase.executeByCompany(companyId);

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
   * GET /api/subscription-payments/pending
   * Lista pagamentos pendentes
   */
  async listPending(req: Request, res: Response): Promise<void> {
    try {
      const payments = await this.listUseCase.executePendingPayments();

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
   * GET /api/subscription-payments/overdue
   * Lista pagamentos vencidos
   */
  async listOverdue(req: Request, res: Response): Promise<void> {
    try {
      const payments = await this.listUseCase.executeOverduePayments();

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
        message: 'Erro ao listar pagamentos vencidos',
        error: errorMessage
      });
    }
  }

  /**
   * PUT /api/subscription-payments/:id
   * Atualiza um pagamento
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const paymentId = parseInt(req.params.id);

      if (isNaN(paymentId)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
        return;
      }

      const updateData = req.body;
      const payment = await this.updateUseCase.execute(paymentId, updateData);

      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'Pagamento não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Pagamento atualizado com sucesso',
        data: payment
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar pagamento',
        error: errorMessage
      });
    }
  }
}
