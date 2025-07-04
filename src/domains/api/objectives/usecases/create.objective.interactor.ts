import {
  IObjectiveGateway,
  CreateObjectiveRequest,
  CreateObjectiveResponse
} from '@domains/api/objectives/interfaces';

export class CreateObjectiveInteractor {
  constructor(private readonly objectiveGateway: IObjectiveGateway) {}

  public async execute(
    request: CreateObjectiveRequest
  ): Promise<CreateObjectiveResponse> {
    const { title, description, id_team, quarter, year } = request;

    // Validar se o quarter está entre 1 e 4
    if (quarter < 1 || quarter > 4) {
      throw new Error('Quarter must be between 1 and 4');
    }

    // Validar se o ano é válido
    const currentYear = new Date().getFullYear();
    if (year < 2020 || year > currentYear + 10) {
      throw new Error('Invalid year');
    }

    const objective = await this.objectiveGateway.create({
      title,
      description,
      id_team,
      quarter,
      year,
      status: 'active'
    });

    return {
      objective
    };
  }
}
