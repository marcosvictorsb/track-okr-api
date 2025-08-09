import { Request, Response } from 'express';
import {
  CreatePlanUseCase,
  ListPlansUseCase,
  GetPlanUseCase,
  UpdatePlanUseCase,
  DeletePlanUseCase
} from '@domains/api/plans/usecases/plan.usecases';
import { PlanRepository } from '@domains/api/plans/repository/plan.repository';
import { efiPayService } from '@adapters/services/efi-pay.service';
import { logger } from '@configs/logger';

export class BackofficePlansController {
  private createUseCase: CreatePlanUseCase;
  private listUseCase: ListPlansUseCase;
  private getUseCase: GetPlanUseCase;
  private updateUseCase: UpdatePlanUseCase;
  private deleteUseCase: DeletePlanUseCase;
  private repository: PlanRepository;
  private logging: typeof logger;

  constructor() {
    this.repository = new PlanRepository();
    this.createUseCase = new CreatePlanUseCase(this.repository);
    this.listUseCase = new ListPlansUseCase(this.repository);
    this.getUseCase = new GetPlanUseCase(this.repository);
    this.updateUseCase = new UpdatePlanUseCase(this.repository);
    this.deleteUseCase = new DeletePlanUseCase(this.repository);
    this.logging = logger;
  }

  /**
   * GET /backoffice/-plans
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
   * GET /backoffice/-plans/:id
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
   * POST /backoffice/-plans
   * Cria um novo plano
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const planData = req.body;

      this.logging.info('Criando novo plano de assinatura', { planData });

      // Validações básicas
      if (!planData.name || planData.interval < 0) {
        res.status(400).json({
          success: false,
          message: 'Campos obrigatórios: name, price_monthly, max_users'
        });
        return;
      }

      const plan = await this.createUseCase.execute(planData);

      this.logging.info('Plano de assinatura criado');

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
   * PUT /backoffice/-plans/:id
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
   * DELETE /backoffice/-plans/:id
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
   * POST /backoffice/-plans/sync-efi
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
   * POST /backoffice/-plans/:id/create-efi-plan
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
        interval: 1, // 1 mês (máximo 24)
        repeats: 12 // 12 meses (mínimo 2)
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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({
        success: false,
        message: 'Erro ao criar plano na Efí Pay',
        error: errorMessage
      });
    }
  }

  /**
   * GET /backoffice/-plans/test-efi-connection
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
