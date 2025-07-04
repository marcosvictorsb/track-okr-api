import { Response } from 'express';
import { DeleteObjectiveInteractor } from '@domains/api/objectives/usecases';
import { IDeleteObjectiveController } from '@domains/api/objectives/interfaces';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';

export class DeleteObjectiveController implements IDeleteObjectiveController {
  constructor(private readonly deleteObjectiveInteractor: DeleteObjectiveInteractor) {}

  public async deleteObjective(request: UserPayload, response: Response): Promise<void> {
    try {
      const { id } = request.params;

      const result = await this.deleteObjectiveInteractor.execute({
        id: Number(id)
      });

      response.status(200).json({
        success: true,
        message: 'Objective deleted successfully',
        data: { deleted: result.success }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      const statusCode = errorMessage.includes('not found') ? 404 : 400;
      
      response.status(statusCode).json({
        success: false,
        message: errorMessage
      });
    }
  }
}
