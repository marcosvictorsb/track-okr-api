import { HttpResponse } from '@protocols/http';
import {
  DeleteUserTeamInteractorDependencies,
  InputDeleteUserTeam,
  IDeleteUserTeamGateway
} from '../interfaces';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';

export class DeleteUserTeamInteractor {
  protected gateway: IDeleteUserTeamGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: DeleteUserTeamInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  async execute(input: InputDeleteUserTeam): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Iniciando remoção de usuário do time', {
        requestTxt: JSON.stringify(input)
      });

      const {
        id,
        id_user_to_remove,
        id_team,
        id_company,
        id_user,
        force_delete
      } = input;

      // Validar se o usuário requisitante pertence à empresa
      const validationResult = await this.userCompanyValidator.execute({
        id_user,
        id_company
      });

      if (!validationResult.isValid) {
        this.gateway.loggerInfo('Usuário não pertence à empresa', {
          id_user,
          id_company
        });
        return this.presenter.forbidden(
          'Usuário não tem permissão para acessar esta empresa'
        );
      }

      const requestingUser = validationResult.user!;

      // Buscar o relacionamento user-team a ser removido
      let userTeamToRemove;

      if (id) {
        userTeamToRemove = await this.gateway.findUserTeam({ id });
      } else if (id_user_to_remove && id_team) {
        userTeamToRemove = await this.gateway.findUserTeam({
          id_user: id_user_to_remove,
          id_team
        });
      } else {
        this.gateway.loggerInfo(
          'Parâmetros insuficientes para identificar o relacionamento'
        );
        return this.presenter.badRequest(
          'Informe o ID ou id_user_to_remove e id_team'
        );
      }

      if (!userTeamToRemove) {
        this.gateway.loggerInfo(
          'Relacionamento user-team não encontrado ou usuário já saiu do time'
        );
        return this.presenter.notFound(
          'Relacionamento user-team não encontrado'
        );
      }

      // Buscar o time para verificar se pertence à empresa
      const team = await this.gateway.findTeam({
        id: userTeamToRemove.id_team,
        id_company
      });

      if (!team) {
        this.gateway.loggerInfo(
          'Time não encontrado ou não pertence à empresa',
          {
            id_company
          }
        );
        return this.presenter.notFound('Time não encontrado');
      }

      // Verificar permissões
      const canRemove = await this.gateway.canRemoveUserFromTeam(
        userTeamToRemove,
        requestingUser
      );

      if (!canRemove.canRemove) {
        this.gateway.loggerInfo('Usuário sem permissão para remover do time', {
          id_user
        });
        return this.presenter.forbidden(
          canRemove.message || 'Sem permissão para remover este usuário do time'
        );
      }

      let success = false;

      // Decidir entre soft delete (leave team) ou hard delete
      if (
        force_delete &&
        (requestingUser.role === 'admin' || requestingUser.role === 'owner')
      ) {
        // Delete físico (apenas admin/owner)
        success = await this.gateway.deleteUserTeam({
          id: userTeamToRemove.id
        });
        this.gateway.loggerInfo(
          'Relacionamento user-team removido fisicamente'
        );
      } else {
        // Soft delete (leave team)
        success = await this.gateway.leaveTeam(
          userTeamToRemove.id_user,
          userTeamToRemove.id_team
        );
        this.gateway.loggerInfo('Usuário saiu do time (soft delete)');
      }

      if (!success) {
        this.gateway.loggerError('Falha ao remover usuário do time');
        return this.presenter.serverError('Falha ao remover usuário do time');
      }

      this.gateway.loggerInfo('Usuário removido do time com sucesso');

      return this.presenter.ok({
        message: force_delete
          ? 'Usuário removido do time permanentemente'
          : 'Usuário saiu do time',
        removed_at: new Date().toISOString()
      });
    } catch (error) {
      this.gateway.loggerError('Erro ao remover usuário do time', { error });
      return this.presenter.serverError('Erro ao remover usuário do time');
    }
  }
}
