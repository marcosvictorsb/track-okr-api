import { Response } from 'express';
import { GetObjectiveInteractor } from '@domains/api/objectives/usecases';
import { IGetObjectiveController } from '@domains/api/objectives/interfaces';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';

export class GetObjectiveController implements IGetObjectiveController {
  constructor(
    private readonly getObjectiveInteractor: GetObjectiveInteractor
  ) {}

  public async getObjectives(
    request: UserPayload,
    response: Response
  ): Promise<void> {
    try {
      const { id_team, quarter, year } = request.query;
      const { id } = request.params;

      const result = await this.getObjectiveInteractor.execute({
        id: id ? Number(id) : undefined,
        id_team: id_team ? Number(id_team) : undefined,
        quarter: quarter ? Number(quarter) : undefined,
        year: year ? Number(year) : undefined
      });

      response.status(200).json({
        success: true,
        message: 'Objectives retrieved successfully',
        data: result.objectives.map((objective) => objective.toJson())
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Internal server error';

      response.status(400).json({
        success: false,
        message: errorMessage
      });
    }
  }
}
