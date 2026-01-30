import { UserCompanyValidationInteractor } from '@domains/common';
import { IPresenter } from '@protocols/presenter';
import {
  ActionUserTeam,
  IManageUserTeamGateway,
  InputManageUserTeam,
  ManageUserTeamInteractorDependencies
} from '../interfaces';

export class ManageUserTeamInteractor {
  protected gateway: IManageUserTeamGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: ManageUserTeamInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  async execute(input: InputManageUserTeam): Promise<{
    action: string;
    team_id?: number;
  }> {
    this.gateway.loggerInfo('Iniciando gerenciamento de user-team', {
      requestTxt: JSON.stringify(input)
    });

    const { id_user_to_manage, id_team, id_company } = input;

    const currentUserTeam =
      await this.gateway.findCurrentUserTeam(id_user_to_manage);

    if (!currentUserTeam && !id_team) {
      this.gateway.loggerInfo(
        'Nenhum time atual encontrado e ID do time não informado',
        {
          data: JSON.stringify({ id_user_to_manage, id_team, id_company })
        }
      );
      return { action: ActionUserTeam.NOTHING_TO_DO };
    }

    if (currentUserTeam && (id_team == null || id_team === undefined)) {
      this.gateway.loggerInfo('ID do time não informado', {
        data: JSON.stringify({ id_user_to_manage, id_team, id_company })
      });
      await this.removeUserFromTeam(id_user_to_manage);

      return { action: ActionUserTeam.TEAM_NOT_FOUND };
    }

    const existingTeam = await this.gateway.findTeam({
      id: id_team,
      id_company
    });

    if (!existingTeam) {
      this.gateway.loggerInfo('Time não encontrado', {
        data: JSON.stringify({ id_team })
      });
      return { action: ActionUserTeam.TEAM_NOT_FOUND };
    }

    if (currentUserTeam && (currentUserTeam.id_team as number) === id_team) {
      return {
        action: ActionUserTeam.NOTHING_TO_DO
      };
    }

    // Adicionando usuário em um time
    if (!currentUserTeam) {
      const { action, team_id } = await this.addUserToTeam(
        id_user_to_manage,
        id_team as number
      );

      this.gateway.loggerInfo('User-team gerenciado com sucesso', {
        data: JSON.stringify({
          id_user: id_user_to_manage,
          id_team: id_team,
          action
        })
      });

      return { action, team_id };
    }

    // alterando o usuário de time
    if (currentUserTeam.id_team !== id_team) {
      await this.changeUserTeam({
        userId: id_user_to_manage,
        fromTeamId: currentUserTeam.id_team,
        toTeamId: id_team
      });

      this.gateway.loggerInfo('User-team gerenciado com sucesso', {
        data: JSON.stringify({
          id_user: id_user_to_manage,
          id_team: id_team,
          action: ActionUserTeam.USER_UPDATED_TEAM
        })
      });

      return {
        action: ActionUserTeam.USER_UPDATED_TEAM,
        team_id: id_team as number
      };
    }

    this.gateway.loggerInfo('Gerenciamento de user-team concluído', {
      data: JSON.stringify({
        id_user: id_user_to_manage,
        id_team
      })
    });

    return { action: ActionUserTeam.NOTHING_TO_DO };
  }

  private async addUserToTeam(
    userId: number,
    teamId: number
  ): Promise<{
    action: string;
    team_id: number;
  }> {
    this.gateway.loggerInfo('Adicionando usuário ao time', {
      data: JSON.stringify({ id_user: userId, id_team: teamId })
    });

    const newUserTeam = await this.gateway.createUserTeam({
      id_user: userId,
      id_team: teamId,
      role_in_team: 'member'
    });

    this.gateway.loggerInfo('Usuário adicionado ao time com sucesso', {
      data: JSON.stringify({
        id_user: userId,
        id_team: teamId,
        user_team_id: newUserTeam.id
      })
    });

    return {
      action: ActionUserTeam.USER_ADD_TEAM,
      team_id: teamId
    };
  }

  private async removeUserFromTeam(
    userId: number
  ): Promise<{ action: string }> {
    this.gateway.loggerInfo('ID do time não informado para remoção', {
      data: JSON.stringify({ id_user: userId })
    });

    const leftSuccess = await this.gateway.leaveCurrentTeam(userId);

    if (!leftSuccess) {
      throw new Error('Falha ao remover usuário do time atual');
    }

    return {
      action: ActionUserTeam.REMOVED_USER_FROM_CURRENT_TEAM
    };
  }

  private async changeUserTeam({ userId, fromTeamId, toTeamId }): Promise<{
    action: string;
    message: string;
    previous_team_id: number;
    new_team_id: number;
    new_user_team_id?: number;
  }> {
    this.gateway.loggerInfo('Trocando usuário de time', {
      data: JSON.stringify({
        id_user: userId,
        from_team: fromTeamId,
        to_team: toTeamId
      })
    });

    // Primeiro, remover do time atual
    const leftSuccess = await this.gateway.leaveCurrentTeam(userId, fromTeamId);
    if (!leftSuccess) {
      throw new Error('Falha ao remover usuário do time atual');
    }

    // Depois, adicionar ao novo time
    const newUserTeam = await this.gateway.createUserTeam({
      id_user: userId,
      id_team: toTeamId,
      role_in_team: 'member'
    });

    this.gateway.loggerInfo('Usuário movido de time com sucesso', {
      data: JSON.stringify({
        id_user: userId,
        from_team: fromTeamId,
        to_team: toTeamId,
        new_user_team_id: newUserTeam.id
      })
    });

    return {
      action: 'team_changed',
      message: 'Usuário movido para novo time',
      previous_team_id: fromTeamId,
      new_team_id: toTeamId,
      new_user_team_id: newUserTeam.id
    };
  }
}
