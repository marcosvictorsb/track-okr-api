import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';
import {
  InputUpdateResultKey,
  UpdateResultKeyControllerDependencies,
  UpdateResultKeyInteractor
} from '../interfaces/update.result.key.interface';

export class UpdateResultKeyController {
  private interactor: UpdateResultKeyInteractor;

  constructor(params: UpdateResultKeyControllerDependencies) {
    this.interactor = params.interactor;
  }

  async updateResultKey(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const idResultKey = parseInt(request.params.id as string);

    const input: InputUpdateResultKey = {
      id: idResultKey,
      name: request.body.name,
      initial_value: request.body.initial_value,
      target_value: request.body.target_value,
      current_value: request.body.current_value,
      unit: request.body.unit,
      responsible_users: request.body.responsible_users,
      responsible_team_id: request.body.responsible_team_id,
      id_company: request.user.id_company,
      id_user: request.user.id
    };

    const result = await this.interactor.execute(input);

    return response.status(result.status).json(result.body);
  }
}
