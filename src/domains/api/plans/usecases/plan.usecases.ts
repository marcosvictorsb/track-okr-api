import { CreatePlanRequest as EfiCreatePlanRequest } from '@adapters/services/efi-pay.service';
import { PlanRepository } from '../repository/plan.repository';
import { efiPayService } from '@adapters/services/efi-pay.service';
import {
  PlanModel,
  PlanCreationAttributes
} from '@domains/api/plans/model/plan.model';
import { logger } from '@configs/logger';

export interface CreatePlanRequest {
  name: string;
  description?: string;
  interval: number;
  repeat: number | null;
  create_efi_plan?: boolean;
  efi_plan_id?: string;
}

export class CreatePlanUseCase {
  protected logging: typeof logger;

  constructor(private planRepository: PlanRepository) {
    this.logging = logger;
  }

  async execute(request: CreatePlanRequest): Promise<PlanModel> {
    let efiPlanId: string | undefined;

    this.logging.info('Case de use criar plano de assinatura iniciado', {
      request
    });

    // Se solicitado, criar o plano na Efí Pay
    if (request.create_efi_plan) {
      try {
        const efiPlanData: EfiCreatePlanRequest = {
          name: request.name,
          interval: request.interval,
          repeats: typeof request.repeat === 'number' ? request.repeat : null
        };

        this.logging.info('Criando plano na Efí Pay', { efiPlanData });

        const efiResponse = await efiPayService.createPlan(efiPlanData);
        efiPlanId = efiResponse.data.plan_id;
      } catch (error) {
        console.error('Erro ao criar plano na Efí Pay:', error);
        throw new Error('Falha ao criar plano na Efí Pay');
      }
    }

    // Criar o plano no banco de dados
    const planData: PlanCreationAttributes = {
      name: request.name,
      description: request.description,
      interval: request?.interval,
      repeats: request.repeat,
      efi_plan_id: efiPlanId,
      is_active: true
    };

    this.logging.info('Criando plano no banco de dados', { planData });

    return await this.planRepository.create(planData);
  }
}

export class ListPlansUseCase {
  constructor(private planRepository: PlanRepository) {}

  async execute(onlyActive: boolean = true): Promise<PlanModel[]> {
    return await this.planRepository.findAll(onlyActive);
  }
}

export class GetPlanUseCase {
  constructor(private planRepository: PlanRepository) {}

  async execute(id: number): Promise<PlanModel | null> {
    return await this.planRepository.findById(id);
  }
}

export class UpdatePlanUseCase {
  constructor(private planRepository: PlanRepository) {}

  async execute(
    id: number,
    updateData: Partial<CreatePlanRequest>
  ): Promise<PlanModel | null> {
    const plan = await this.planRepository.findById(id);
    if (!plan) {
      return null;
    }

    return await this.planRepository.update(id, updateData);
  }
}

export class DeletePlanUseCase {
  constructor(private planRepository: PlanRepository) {}

  async execute(id: number): Promise<boolean> {
    const plan = await this.planRepository.findById(id);
    if (!plan) {
      return false;
    }

    // Desativar ao invés de deletar para manter histórico
    await this.planRepository.update(id, { is_active: false });
    return true;
  }
}
