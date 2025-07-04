import {
  IObjectiveGateway,
  GetObjectiveRequest,
  GetObjectiveResponse
} from '@domains/api/objectives/interfaces';

export class GetObjectiveInteractor {
  constructor(private readonly objectiveGateway: IObjectiveGateway) {}

  public async execute(
    request: GetObjectiveRequest
  ): Promise<GetObjectiveResponse> {
    const { id, id_team, quarter, year } = request;

    let objectives;

    if (id) {
      const objective = await this.objectiveGateway.findById(id);
      objectives = objective ? [objective] : [];
    } else if (id_team) {
      objectives = await this.objectiveGateway.findByTeam(id_team);
    } else if (quarter && year) {
      objectives = await this.objectiveGateway.findByQuarter(quarter, year);
    } else {
      throw new Error(
        'At least one search criteria must be provided (id, id_team, or quarter+year)'
      );
    }

    return {
      objectives
    };
  }
}
