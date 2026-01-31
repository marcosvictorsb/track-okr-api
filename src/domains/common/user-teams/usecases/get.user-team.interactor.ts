import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  FindUserTeamCriteria,
  GetUserTeamInteractorDependencies,
  IGetUserTeamGateway,
  InputGetUserTeam
} from '../interfaces';

export class GetUserTeamInteractor {
  protected gateway: IGetUserTeamGateway;
  protected presenter: IPresenter;

  constructor(params: GetUserTeamInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  async execute(input: InputGetUserTeam): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Iniciando busca de relacionamentos user-team', {
        requestTxt: JSON.stringify(input)
      });

      const { id_user, id_team, id_user_to_find, role_in_team } = input;

      const criteria: FindUserTeamCriteria = {};

      if (id_team) {
        criteria.id_team = id_team;
      }

      if (id_user_to_find) {
        criteria.id_user = id_user_to_find;
      } else if (id_user && !id_team) {
        criteria.id_user = id_user;
      }

      if (role_in_team) {
        criteria.role_in_team = role_in_team;
      }

      const userTeams = await this.gateway.findUserTeams(criteria);

      if (!userTeams || userTeams.length === 0) {
        this.gateway.loggerInfo('Nenhum relacionamento user-team encontrado');
        return this.presenter.ok([]);
      }

      const serializedUserTeams = userTeams.map((userTeam) =>
        userTeam.toJSON()
      );

      this.gateway.loggerInfo('Relacionamentos user-team encontrados');

      return this.presenter.ok(serializedUserTeams);
    } catch (error) {
      this.gateway.loggerError('Erro ao buscar relacionamentos user-team', {
        error
      });
      return this.presenter.serverError(
        'Erro ao buscar relacionamentos user-team'
      );
    }
  }
}
