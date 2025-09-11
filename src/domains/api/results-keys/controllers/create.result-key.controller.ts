import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';
import {
  CreateResultKeyControllerDependencies,
  InputCreateResultKey
} from '../interfaces/create.result-key.interface';

export class CreateResultKeyController {
  protected interactor: CreateResultKeyControllerDependencies['interactor'];

  constructor(params: CreateResultKeyControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async createResultKey(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const {
      name,
      initial_value,
      target_value,
      current_value,
      unit,
      responsible_team_id,
      responsible_users,
      id_okr
    } = request.body;

    const { id_company, id: id_user } = request.user;
    const input: InputCreateResultKey = {
      name,
      initial_value,
      target_value,
      current_value,
      unit: String(unit).length ? unit : '',
      responsible_team_id,
      responsible_users,
      id_okr,
      id_company,
      id_user
    };
    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
