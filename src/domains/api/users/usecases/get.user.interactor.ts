import { HttpResponse } from '@protocols/http';
import {
  FindUserCriteria,
  GetUserInteractorDependencies,
  InputGetUser,
  UserStatus
} from '../interfaces';
import { IPresenter } from '@protocols/presenter';
import { GetUserGateway } from '../gateways/get.user.gateway';
import { UserEntity } from '../entity/user.entity';
import { GetUserTeamInteractor } from '@domains/common/user-teams/usecases';

export class GetUserInteractor {
  protected gateway: GetUserGateway;
  protected presenter: IPresenter;
  protected getUserTeamInteractor: GetUserTeamInteractor;

  constructor(params: GetUserInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.getUserTeamInteractor = params.getUserTeamInteractor;
  }

  async execute(input: InputGetUser): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Iniciando a busca dos usuários', {
        requestTxt: JSON.stringify(input)
      });
      const { id_user, id_company } = input;

      const user = await this.gateway.findUser({ id: id_user, id_company });
      if (user && user.id_company !== id_company) {
        this.gateway.loggerInfo('Usuário não pertence a empresa informada', {
          id_user: id_user,
          id_company: id_company
        });
        return this.presenter.forbidden(
          'Usuário não pertence a empresa informada'
        );
      }

      const criteria: FindUserCriteria = {
        id_company
      };

      const users = await this.gateway.findUsers(criteria);

      if (!users || users.length === 0) {
        this.gateway.loggerInfo('Nenhum usuário encontrado');
        return this.presenter.ok([]);
      }

      const statusOrder = [
        UserStatus.ACTIVE,
        UserStatus.PENDING_ACTIVATION,
        UserStatus.INACTIVE
      ];

      users.sort((a: Partial<UserEntity>, b: Partial<UserEntity>) => {
        if (!a.status || !b.status) {
          return 0;
        }
        return (
          statusOrder.indexOf(a.status as UserStatus) -
          statusOrder.indexOf(b.status as UserStatus)
        );
      });

      // Buscar o id_team para cada usuário
      const usersWithTeam = await Promise.all(
        users.map(async (user) => {
          try {
            // Buscar o time atual do usuário
            const userTeamResponse = await this.getUserTeamInteractor.execute({
              id_company,
              id_user: id_user,
              id_user_to_find: user.id,
              include_left: false
            });

            let currentTeamId = null;
            if (
              userTeamResponse.status === 200 &&
              userTeamResponse.body &&
              Array.isArray(userTeamResponse.body)
            ) {
              const userTeams = userTeamResponse.body;
              // Pegar o primeiro time ativo (já que um usuário só pode estar em um time)
              const activeTeam = userTeams.find(
                (ut: { left_at?: Date | null; id_team: number }) => !ut.left_at
              );
              if (activeTeam) {
                currentTeamId = activeTeam.id_team;
              }
            }

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              status: user.status,
              id_company: user.id_company,
              created_at: user.created_at,
              updated_at: user.updated_at,
              deleted_at: user.deleted_at,
              current_team_id: currentTeamId
            };
          } catch (error) {
            this.gateway.loggerError('Erro ao buscar time do usuário', {
              error: String(error),
              data: JSON.stringify({ id_user: user.id })
            });
            // Em caso de erro, retornar o usuário sem o team_id
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              status: user.status,
              id_company: user.id_company,
              created_at: user.created_at,
              updated_at: user.updated_at,
              deleted_at: user.deleted_at,
              current_team_id: null
            };
          }
        })
      );

      return this.presenter.ok(usersWithTeam);
    } catch (error) {
      this.gateway.loggerError('Erro ao buscar usuários', { error });
      return this.presenter.serverError('Erro ao buscar usuários');
    }
  }
}
