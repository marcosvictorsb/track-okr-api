import { UserPayload } from "@middlewares/auth.jwt.middlewares";
import { CreatePlannerControllerDependencies, InputCreatePlanner } from "../interfaces";
import { CreatePlannerInteractor } from "../usecases";
import { Response } from 'express';

export class CreatePlannerController {
  protected interactor: CreatePlannerInteractor;

  constructor(params: CreatePlannerControllerDependencies){
    this.interactor = params.interactor
  }

  public async createPlanner(request: UserPayload, response: Response): Promise<Response> {
    const input: InputCreatePlanner = {
      title: request.body.title,
      description: request.body.description,
      year: request.body.year,
      id_company: request.body.id_company      
    };
    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}