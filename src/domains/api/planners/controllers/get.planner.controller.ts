import { UserPayload } from "@middlewares/auth.jwt.middlewares";
import { GetPlannerControllerDependencies, InputGetPlanner } from "../interfaces";
import { GetPlannerInteractor } from "../usecases";
import { Response } from 'express';

export class GetPlannerController {
  protected interactor: GetPlannerInteractor;

  constructor(params: GetPlannerControllerDependencies){
    this.interactor = params.interactor
  }

  public async getPlanner(request: UserPayload, response: Response): Promise<Response> {
    const input: InputGetPlanner = {
      id_company: request.user.id_company,
      id_user: request.user.id,
      limite: request.query.limite ? parseInt(request.query.limite as string) : 10,      
    };
    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}