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

      // Filtrar IDs válidos e criar Map para lookup eficiente
      const idsUser = users
        .map((user: UserEntity) => user.id)
        .filter((id): id is number => id !== undefined && id !== null);

      if (idsUser.length === 0) {
        this.gateway.loggerInfo('Nenhum usuário com ID válido encontrado');
        return this.presenter.ok(
          users.map((user) => ({ ...user, current_team_id: null }))
        );
      }

      const userTeams = await this.gateway.findUserTeams({
        idsUser
      });

      // Criar um Map para lookup O(1) em vez de find O(n)
      const userTeamMap = new Map(
        userTeams
          .filter((ut) => !ut.deleted_at)
          .map((ut) => [ut.id_user, ut.id_team])
      );

      const usersWithTeam = users.map((user: UserEntity) => ({
        ...user,
        current_team_id: userTeamMap.get(user.id as number) || null
      }));

      const getProfiles = await this.gateway.getProfileByIds({
        id_users: idsUser
      });

      // Criar um Map para lookup O(1) dos profiles
      const profileMap = new Map(
        getProfiles.map((profile) => [
          profile.id_user,
          {
            position: profile.position,
            photo_url: profile.photo_url
          }
        ])
      );

      // Incluir no userWithTeam o profile.position and profile.photo_url
      const usersWithTeamAndProfile = usersWithTeam.map((user: UserEntity) => ({
        ...user,
        position: profileMap.get(user.id as number)?.position || null,
        photo_url: profileMap.get(user.id as number)?.photo_url || null
      }));

      return this.presenter.ok(usersWithTeamAndProfile);
    } catch (error) {
      this.gateway.loggerError('Erro ao buscar usuários', { error });
      return this.presenter.serverError('Erro ao buscar usuários');
    }
  }
}
