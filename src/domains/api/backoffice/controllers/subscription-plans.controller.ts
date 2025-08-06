import { Request, Response } from 'express';
import {
  CreateSubscriptionPlanUseCase,
  ListSubscriptionPlansUseCase,
  GetSubscriptionPlanUseCase,
  UpdateSubscriptionPlanUseCase,
  DeleteSubscriptionPlanUseCase
} from '@domains/api/subscription-plans/usecases/subscription-plan.usecases';
import { SubscriptionPlanRepository } from '@domains/api/subscription-plans/repository/subscription-plan.repository';
import { efiPayService } from '@adapters/services/efi-pay.service';

export class BackofficeSubscriptionPlansController {
  private createUseCase: CreateSubscriptionPlanUseCase;
  private listUseCase: ListSubscriptionPlansUseCase;
  private getUseCase: GetSubscriptionPlanUseCase;
  private updateUseCase: UpdateSubscriptionPlanUseCase;
  private deleteUseCase: DeleteSubscriptionPlanUseCase;
  private repository: SubscriptionPlanRepository;

  constructor() {
    this.repository = new SubscriptionPlanRepository();
    this.createUseCase = new CreateSubscriptionPlanUseCase(this.repository);
    this.listUseCase = new ListSubscriptionPlansUseCase(this.repository);
    this.getUseCase = new GetSubscriptionPlanUseCase(this.repository);
    this.updateUseCase = new UpdateSubscriptionPlanUseCase(this.repository);
    this.deleteUseCase = new DeleteSubscriptionPlanUseCase(this.repository);
  }

  /**
   * GET /backoffice/subscription-plans
   * Lista todos os planos
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { active } = req.query;
      const onlyActive = active !== 'false';

      const plans = await this.listUseCase.execute(onlyActive);

      res.json({
        success: true,
        data: plans,
        count: plans.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao listar planos',
        error: error.message
      });
    }
  }

  /**
   * GET /backoffice/subscription-plans/:id
   * Busca um plano específico
   */
  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const plan = await this.getUseCase.execute(Number(id));

      if (!plan) {
        res.status(404).json({
          success: false,
          message: 'Plano não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: plan
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar plano',
        error: error.message
      });
    }
  }

  /**
   * POST /backoffice/subscription-plans
   * Cria um novo plano
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const planData = req.body;

      // Validações básicas
      if (!planData.name || !planData.price_monthly || !planData.max_users) {
        res.status(400).json({
          success: false,
          message: 'Campos obrigatórios: name, price_monthly, max_users'
        });
        return;
      }

      const plan = await this.createUseCase.execute(planData);

      res.status(201).json({
        success: true,
        message: 'Plano criado com sucesso',
        data: plan
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao criar plano',
        error: error.message
      });
    }
  }

  /**
   * PUT /backoffice/subscription-plans/:id
   * Atualiza um plano
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const plan = await this.updateUseCase.execute(Number(id), updateData);

      if (!plan) {
        res.status(404).json({
          success: false,
          message: 'Plano não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Plano atualizado com sucesso',
        data: plan
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar plano',
        error: error.message
      });
    }
  }

  /**
   * DELETE /backoffice/subscription-plans/:id
   * Desativa um plano
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.deleteUseCase.execute(Number(id));

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Plano não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Plano desativado com sucesso'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao desativar plano',
        error: error.message
      });
    }
  }

  /**
   * POST /backoffice/subscription-plans/sync-efi
   * Sincroniza planos com a Efí Pay
   */
  async syncWithEfi(req: Request, res: Response): Promise<void> {
    try {
      const efiPlans = await efiPayService.listPlans();
      const localPlans = await this.listUseCase.execute(false);

      const syncResults = {
        efi_plans: efiPlans.data || [],
        local_plans: localPlans,
        synchronized_at: new Date().toISOString()
      };

      res.json({
        success: true,
        message: 'Sincronização concluída',
        data: syncResults
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro na sincronização com Efí Pay',
        error: error.message
      });
    }
  }

  /**
   * POST /backoffice/subscription-plans/:id/create-efi-plan
   * Cria um plano local na Efí Pay
   */
  async createEfiPlan(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const plan = await this.getUseCase.execute(Number(id));

      if (!plan) {
        res.status(404).json({
          success: false,
          message: 'Plano não encontrado'
        });
        return;
      }

      if (plan.efi_plan_id) {
        res.status(400).json({
          success: false,
          message: 'Plano já possui ID da Efí Pay'
        });
        return;
      }

      const efiPlanData = {
        name: plan.name,
        interval: 30,
        repeats: 0,
        value: Math.round(plan.price_monthly * 100),
        metadata: {
          custom_id: `local_plan_${plan.id}`,
          notification_url: process.env.EFI_WEBHOOK_URL
        }
      };

      const efiResponse = await efiPayService.createPlan(efiPlanData);

      const updatedPlan = await this.updateUseCase.execute(Number(id), {
        efi_plan_id: efiResponse.data.plan_id
      });

      res.json({
        success: true,
        message: 'Plano criado na Efí Pay',
        data: {
          local_plan: updatedPlan,
          efi_response: efiResponse.data
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao criar plano na Efí Pay',
        error: error.message
      });
    }
  }

  /**
   * GET /backoffice/subscription-plans/test-efi-connection
   * Testa a conexão com a Efí Pay
   */
  async testEfiConnection(req: Request, res: Response): Promise<void> {
    try {
      const testResult = await efiPayService.testConnection();

      if (testResult.success) {
        res.json({
          success: true,
          message: testResult.message,
          data: {
            connection_status: 'ok',
            environment:
              process.env.EFI_SANDBOX === 'true' ? 'sandbox' : 'production',
            timestamp: new Date().toISOString()
          }
        });
      } else {
        res.status(500).json({
          success: false,
          message: testResult.message,
          data: {
            connection_status: 'error',
            environment:
              process.env.EFI_SANDBOX === 'true' ? 'sandbox' : 'production',
            timestamp: new Date().toISOString()
          }
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({
        success: false,
        message: 'Erro ao testar conexão com Efí Pay',
        error: errorMessage
      });
    }
  }
}
