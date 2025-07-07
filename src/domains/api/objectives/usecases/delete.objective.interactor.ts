import {
  IDeleteObjectiveGateway,
  DeleteObjectiveRequest,
  DeleteObjectiveResponse
} from '@domains/api/objectives/interfaces';

export class DeleteObjectiveInteractor {
  constructor(private readonly objectiveGateway: IDeleteObjectiveGateway) {}

  public async execute(
    request: DeleteObjectiveRequest
  ): Promise<DeleteObjectiveResponse> {
    const { id } = request;

    // Verificar se o objetivo existe
    const existingObjective = await this.objectiveGateway.findById(id);
    if (!existingObjective) {
      throw new Error('Objective not found');
    }

    const success = await this.objectiveGateway.delete(id);

    if (!success) {
      throw new Error('Failed to delete objective');
    }

    return {
      success: true
    };
  }
}
