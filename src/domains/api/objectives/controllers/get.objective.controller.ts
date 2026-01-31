import {
  GetObjectiveControllerDependencies,
  IGetObjectiveController,
  InputGetObjective
} from '@domains/api/objectives/interfaces/get.objective.interface';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';

export class GetObjectiveController implements IGetObjectiveController {
  protected interactor: GetObjectiveControllerDependencies['interactor'];

  constructor(params: GetObjectiveControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async getObjectives(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const { id_team, quarter, year, status } = request.query;
    const { id } = request.params;
    const { id_company, id: id_user } = request.user;

    const input: InputGetObjective = {
      id: id ? Number(id) : undefined,
      id_team: id_team ? Number(id_team) : undefined,
      quarter: quarter ? Number(quarter) : undefined,
      year: year ? Number(year) : undefined,
      id_company,
      id_user,
      limite: request.query.limite ? Number(request.query.limite) : 10,
      status: status ? String(status) : undefined
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
