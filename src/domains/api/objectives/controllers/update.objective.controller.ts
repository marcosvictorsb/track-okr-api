import { Response } from 'express';
import { UpdateObjectiveInteractor } from '@domains/api/objectives/usecases';
import { IUpdateObjectiveController } from '@domains/api/objectives/interfaces';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';

export class UpdateObjectiveController implements IUpdateObjectiveController {
  constructor(private readonly updateObjectiveInteractor: UpdateObjectiveInteractor) {}

  public async updateObjective(request: UserPayload, response: Response): Promise<void> {
    try {
      const { id } = request.params;
      const { title, description, status, quarter, year } = request.body;

      const result = await this.updateObjectiveInteractor.execute({
        id: Number(id),
        title,
        description,
        status,
        quarter,
        year
      });

      response.status(200).json({
        success: true,
        message: 'Objective updated successfully',
        data: result.objective.toJson()
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
