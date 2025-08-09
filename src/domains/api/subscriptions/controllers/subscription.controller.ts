import { Request, Response } from 'express';
import {
  CreateSubscriptionUseCase,
  GetSubscriptionUseCase,
  UpdateSubscriptionUseCase,
  UpgradeSubscriptionUseCase,
  CreateSubscriptionRequest
} from '../usecases/subscription.usecases';
import { SubscriptionRepository } from '../repository/subscription.repository';
import { SubscriptionPlanRepository } from '@domains/api/plans/repository/plan.repository';
import SubscriptionModel from '../model/subscription.model';

export class SubscriptionController {
  private createUseCase: CreateSubscriptionUseCase;
  private getUseCase: GetSubscriptionUseCase;
  private updateUseCase: UpdateSubscriptionUseCase;
  private upgradeUseCase: UpgradeSubscriptionUseCase;
  private subscriptionRepository: SubscriptionRepository;
  private planRepository: SubscriptionPlanRepository;

  constructor() {
    this.subscriptionRepository = new SubscriptionRepository({
      model: SubscriptionModel
    });
    this.planRepository = new SubscriptionPlanRepository();
    this.createUseCase = new CreateSubscriptionUseCase(
      this.subscriptionRepository,
      this.planRepository
    );
    this.getUseCase = new GetSubscriptionUseCase(this.subscriptionRepository);
    this.updateUseCase = new UpdateSubscriptionUseCase(
      this.subscriptionRepository
    );
    this.upgradeUseCase = new UpgradeSubscriptionUseCase(
      this.subscriptionRepository,
      this.planRepository
    );
  }

  /**
   * POST /api/subscriptions
   * Cria uma nova assinatura
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const subscriptionRequest: CreateSubscriptionRequest = req.body;

      const subscription =
        await this.createUseCase.execute(subscriptionRequest);

      res.status(201).json({
        success: true,
        message: 'Assinatura criada com sucesso',
        data: subscription
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(400).json({
        success: false,
        message: 'Erro ao criar assinatura',
        error: errorMessage
      });
    }
  }

  /**
   * GET /api/subscriptions/:id
   * Busca uma assinatura específica
   */
  async get(req: Request, res: Response): Promise<void> {
    try {
      const subscriptionId = parseInt(req.params.id);

      if (isNaN(subscriptionId)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
        return;
      }

      const subscription = await this.getUseCase.execute({
        id: subscriptionId
      });

      if (!subscription) {
        res.status(404).json({
          success: false,
          message: 'Assinatura não encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: subscription
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar assinatura',
        error: errorMessage
      });
    }
  }

  /**
   * GET /api/subscriptions/company/:companyId
   * Busca a assinatura ativa de uma empresa
   */
  async getByCompany(req: Request, res: Response): Promise<void> {
    try {
      const companyId = parseInt(req.params.companyId);

      if (isNaN(companyId)) {
        res.status(400).json({
          success: false,
          message: 'ID da empresa inválido'
        });
        return;
      }

      const subscription = await this.getUseCase.executeByCompany(companyId);

      if (!subscription) {
        res.status(404).json({
          success: false,
          message: 'Assinatura não encontrada para esta empresa'
        });
        return;
      }

      res.json({
        success: true,
        data: subscription
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar assinatura',
        error: errorMessage
      });
    }
  }

  /**
   * PUT /api/subscriptions/:id/cancel
   * Cancela uma assinatura
   */
  async cancel(req: Request, res: Response): Promise<void> {
    try {
      const subscriptionId = parseInt(req.params.id);

      if (isNaN(subscriptionId)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
        return;
      }

      const cancelled =
        await this.updateUseCase.cancelSubscription(subscriptionId);

      if (!cancelled) {
        res.status(404).json({
          success: false,
          message: 'Assinatura não encontrada ou não pôde ser cancelada'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Assinatura cancelada com sucesso'
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({
        success: false,
        message: 'Erro ao cancelar assinatura',
        error: errorMessage
      });
    }
  }

  /**
   * PUT /api/subscriptions/:id/upgrade
   * Faz upgrade de uma assinatura para um plano superior
   */
  async upgrade(req: Request, res: Response): Promise<void> {
    try {
      const subscriptionId = parseInt(req.params.id);
      const { new_plan_id } = req.body;

      if (isNaN(subscriptionId) || !new_plan_id) {
        res.status(400).json({
          success: false,
          message: 'ID da assinatura ou novo plano inválido'
        });
        return;
      }

      const subscription = await this.upgradeUseCase.execute(
        subscriptionId,
        new_plan_id
      );

      if (!subscription) {
        res.status(404).json({
          success: false,
          message: 'Assinatura não encontrada ou upgrade não pôde ser realizado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Upgrade realizado com sucesso',
        data: subscription
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({
        success: false,
        message: 'Erro ao fazer upgrade da assinatura',
        error: errorMessage
      });
    }
  }
}
