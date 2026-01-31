import { IDeleteObjectiveController } from '@domains/api/objectives/interfaces';
import { DeleteObjectiveInteractor } from '@domains/api/objectives/usecases';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';

export class DeleteObjectiveController implements IDeleteObjectiveController {
  constructor(
    private readonly deleteObjectiveInteractor: DeleteObjectiveInteractor
  ) {}

  public async deleteObjective(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const { id } = request.params;

    const { status, body } = await this.deleteObjectiveInteractor.execute({
      id: Number(id),
      id_company: request.user.id_company,
      id_user: request.user.id
    });

    return response.status(status).json(body);
  }
}
