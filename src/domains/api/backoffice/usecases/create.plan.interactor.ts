import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  CreatePlanInteractorDependencies,
  ICreatePlanGateway,
  InputCreatePlan
} from '../interfaces/create.plan.interfaces';

export class CreatePlanInteractor {
  protected presenter: IPresenter;
  protected gateway: ICreatePlanGateway;

  constructor(params: CreatePlanInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  async execute(input: InputCreatePlan): Promise<HttpResponse> {
    this.gateway.loggerInfo('Case de use criar plano de assinatura iniciado');
    const { name } = input;

    const plan = await this.gateway.findPlan({ name });

    if (plan) {
      this.gateway.loggerInfo('Plano já existe', { requestTxt: name });
      return this.presenter.conflict('Plano já existe');
    }

    const criteria = {
      name: input.name,
      description: input.description || '',
      max_users: input.max_users,
      max_planners: input.max_planners,
      max_teams: input.max_teams,
      max_objectives_per_quarter: input.max_objectives_per_quarter,
      max_key_results_per_objective: input.max_key_results_per_objective,
      secret: input.secret
    };

    const planCreated = await this.gateway.createPlan(criteria);
    if (!planCreated) {
      this.gateway.loggerError('Erro ao criar plano', { requestTxt: name });
      return this.presenter.serverError('Erro ao criar plano');
    }
    return this.presenter.created(planCreated);
  }
}

// export class ListPlansUseCase {
//   constructor(private planRepository: PlanRepository) {}

//   async execute(onlyActive: boolean = true): Promise<PlanModel[]> {
//     return await this.planRepository.findAll(onlyActive);
//   }
// }

// export class GetPlanUseCase {
//   constructor(private planRepository: PlanRepository) {}

//   async execute(id: number): Promise<PlanModel | null> {
//     return await this.planRepository.findById(id);
//   }
// }

// export class UpdatePlanUseCase {
//   constructor(private planRepository: PlanRepository) {}

//   async execute(
//     id: number,
//     updateData: Partial<CreatePlanRequest>
//   ): Promise<PlanModel | null> {
//     const plan = await this.planRepository.findById(id);
//     if (!plan) {
//       return null;
//     }

//     return await this.planRepository.update(id, updateData);
//   }
// }

// export class DeletePlanUseCase {
//   constructor(private planRepository: PlanRepository) {}

//   async execute(id: number): Promise<boolean> {
//     const plan = await this.planRepository.findById(id);
//     if (!plan) {
//       return false;
//     }

//     // Desativar ao invés de deletar para manter histórico
//     await this.planRepository.update(id, { is_active: false });
//     return true;
//   }
// }
