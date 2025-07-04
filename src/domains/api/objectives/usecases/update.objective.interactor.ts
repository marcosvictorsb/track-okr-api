import {
  IObjectiveGateway,
  UpdateObjectiveRequest,
  UpdateObjectiveResponse
} from '@domains/api/objectives/interfaces';

export class UpdateObjectiveInteractor {
  constructor(private readonly objectiveGateway: IObjectiveGateway) {}

  public async execute(
    request: UpdateObjectiveRequest
  ): Promise<UpdateObjectiveResponse> {
    const { id, title, description, status, quarter, year } = request;

    // Verificar se o objetivo existe
    const existingObjective = await this.objectiveGateway.findById(id);
    if (!existingObjective) {
      throw new Error('Objective not found');
    }

    // Validar quarter se fornecido
    if (quarter !== undefined && (quarter < 1 || quarter > 4)) {
      throw new Error('Quarter must be between 1 and 4');
    }

    // Validar year se fornecido
    if (year !== undefined) {
      const currentYear = new Date().getFullYear();
      if (year < 2020 || year > currentYear + 10) {
        throw new Error('Invalid year');
      }
    }

    const updateData: Record<string, unknown> = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (quarter !== undefined) updateData.quarter = quarter;
    if (year !== undefined) updateData.year = year;

    const objective = await this.objectiveGateway.update(id, updateData);

    if (!objective) {
      throw new Error('Failed to update objective');
    }

    return {
      objective
    };
  }
}
