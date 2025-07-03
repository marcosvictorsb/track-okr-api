import { HttpResponse } from '@protocols/http';
import {
  GetUserTeamInteractorDependencies,
  InputGetUserTeam,
  IGetUserTeamGateway,
  FindUserTeamCriteria
} from '../interfaces';
import { IPresenter } from '@protocols/presenter';

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

      const {
        id_company,
        id_user,
        id_team,
        id_user_to_find,
        role_in_team,
        include_left
      } = input;

      // Buscar o usuário que está fazendo a requisição (se informado)
      if (id_user) {
        const requestingUser = await this.gateway.findUser({
          id: id_user,
          id_company
        });

        if (!requestingUser) {
          this.gateway.loggerInfo('Usuário requisitante não encontrado', {
            id_user: id_user,
            id_company: id_company
          });
          return this.presenter.forbidden('Usuário não tem permissão');
        }

        // Se especificou um time, verificar permissões
        if (id_team) {
          const team = await this.gateway.findTeam({
            id: id_team,
            id_company
          });

          if (!team) {
            this.gateway.loggerInfo('Time não encontrado', {
              id_company: id_company
            });
            return this.presenter.notFound('Time não encontrado');
          }

          const canView = await this.gateway.canViewTeam(requestingUser, team);
          if (!canView.canView) {
            this.gateway.loggerInfo(
              'Usuário sem permissão para visualizar o time',
              {
                id_user: id_user,
                id_company: id_company
              }
            );
            return this.presenter.forbidden(
              canView.message || 'Sem permissão para visualizar o time'
            );
          }
        }
      }

      // Construir critérios de busca
      const criteria: FindUserTeamCriteria = {};

      if (id_team) {
        criteria.id_team = id_team;
      }

      if (id_user_to_find) {
        criteria.id_user = id_user_to_find;
      } else if (id_user && !id_team) {
        // Se não especificou time e não especificou usuário para buscar,
        // buscar os times do usuário requisitante
        criteria.id_user = id_user;
      }

      if (role_in_team) {
        criteria.role_in_team = role_in_team;
      }

      // Se não incluir usuários que saíram, filtrar apenas ativos
      if (!include_left) {
        criteria.left_at = undefined;
      }

      let userTeams;

      // Se buscar por time específico, usar método otimizado
      if (id_team && !id_user_to_find) {
        if (include_left) {
          userTeams = await this.gateway.findUserTeams(criteria);
        } else {
          userTeams = await this.gateway.findActiveUsersByTeam(id_team);
        }
      }
      // Se buscar por usuário específico, usar método otimizado
      else if (criteria.id_user && !id_team) {
        if (include_left) {
          userTeams = await this.gateway.findUserTeams(criteria);
        } else {
          userTeams = await this.gateway.findActiveTeamsByUser(
            criteria.id_user
          );
        }
      }
      // Busca geral
      else {
        userTeams = await this.gateway.findUserTeams(criteria);
      }

      if (!userTeams || userTeams.length === 0) {
        this.gateway.loggerInfo('Nenhum relacionamento user-team encontrado');
        return this.presenter.ok([]);
      }

      // Serializar os dados
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
