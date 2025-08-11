import { Request, Response } from 'express';
import { logger } from '@configs/logger';
import { CreatePlanInteractor } from '../usecases';
import {
  CreatePlanControllerDependencies,
  InputCreatePlan
} from '../interfaces/create.plan.interfaces';

export class CreatePlanController {
  protected interactor: CreatePlanInteractor;

  constructor(params: CreatePlanControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const planData = request.body;

    logger.info('Criando novo plano de assinatura', { planData });
    const input: InputCreatePlan = {
      max_users: planData.max_users,
      max_planners: planData.max_planners,
      max_teams: planData.max_planners,
      max_objectives_per_quarter: planData.max_planners,
      max_key_results_per_objective: planData.max_key_results_per_objective,
      name: planData.name
    };

    const httpResponse = await this.interactor.execute(input);

    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
