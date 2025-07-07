import { HttpResponse } from '@protocols/http';
import {
  IObjectiveGateway,
  GetObjectiveInteractorDependencies,
  InputGetObjective
} from '@domains/api/objectives/interfaces';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import { ObjectiveEntity } from '../entity/objective.entity';

export class GetObjectiveInteractor {
  protected gateway: IObjectiveGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: GetObjectiveInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  public async execute(input: InputGetObjective): Promise<HttpResponse> {
    try {
      console.log('Iniciando a busca dos objetivos', {
        requestTxt: JSON.stringify(input)
      });

      const { id, id_team, quarter, year, id_company, id_user } = input;

      // Validar usuário e empresa
      const validation = await this.userCompanyValidator.execute({
        id_user,
        id_company
      });

      if (!validation.isValid) {
        console.log('Usuário ou empresa inválidos', {
          id_user,
          id_company
        });
        return this.presenter.badRequest('Usuário ou empresa inválidos');
      }

      let objectives;

      if (id) {
        const objective = await this.gateway.findById(id);
        objectives = objective ? [objective] : [];
      } else if (id_team) {
        objectives = await this.gateway.findByTeam(id_team);
      } else if (quarter && year) {
        objectives = await this.gateway.findByQuarter(quarter, year);
      } else {
        // Se não há critérios específicos, retornar erro
        return this.presenter.badRequest(
          'At least one search criteria must be provided (id, id_team, or quarter+year)'
        );
      }

      if (!objectives || objectives.length === 0) {
        console.log('Nenhum objetivo encontrado');
        return this.presenter.ok([]);
      }

      const idsTeam = objectives.map(
        (objective: ObjectiveEntity) => objective.id_team
      );
      const teams = await this.gateway.findTeam({ ids: idsTeam });

      objectives.forEach((objective: ObjectiveEntity) => {
        const team = teams.find((team) => team.id === objective.id_team);
        if (team) {
          objective.team_name = team.name;
        }
      });

      console.log('Objetivos encontrados com sucesso');
      return this.presenter.ok(objectives);
    } catch (error) {
      console.error('Erro ao buscar objetivos', { error });
      return this.presenter.serverError('Erro ao buscar objetivos');
    }
  }
}
