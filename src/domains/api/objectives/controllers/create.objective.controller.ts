import { Response } from 'express';
import { CreateObjectiveInteractor } from '@domains/api/objectives/usecases';
import { ICreateObjectiveController } from '@domains/api/objectives/interfaces';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';

export class CreateObjectiveController implements ICreateObjectiveController {
  constructor(private readonly createObjectiveInteractor: CreateObjectiveInteractor) {}

  public async createObjective(request: UserPayload, response: Response): Promise<void> {
    try {
      const { title, description, id_team, quarter, year } = request.body;

      const result = await this.createObjectiveInteractor.execute({
        title,
        description,
        id_team,
        quarter,
        year
      });

      response.status(201).json({
        success: true,
        message: 'Objective created successfully',
        data: result.objective.toJson()
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      
      response.status(400).json({
        success: false,
        message: errorMessage
      });
    }
  }
}
