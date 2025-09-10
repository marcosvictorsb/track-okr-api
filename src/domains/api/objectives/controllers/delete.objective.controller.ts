import { Response } from 'express';
import { DeleteObjectiveInteractor } from '@domains/api/objectives/usecases';
import { IDeleteObjectiveController } from '@domains/api/objectives/interfaces';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';

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
