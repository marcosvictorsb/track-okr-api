import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  InputUpdateUserTeam,
  IUpdateUserTeamGateway,
  UpdateUserTeamInteractorDependencies
} from '../interfaces';

export class UpdateUserTeamInteractor {
  protected gateway: IUpdateUserTeamGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: UpdateUserTeamInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  async execute(input: InputUpdateUserTeam): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo(
        'Iniciando atualização de relacionamento user-team',
        {
          requestTxt: JSON.stringify(input)
        }
      );

      const {
        id,
        id_user_to_update,
        id_team,
        role_in_team,
        id_company,
        id_user
      } = input;

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

      let userTeamToUpdate;

      if (id) {
        userTeamToUpdate = await this.gateway.findUserTeam({ id });
      } else if (id_user_to_update && id_team) {
        userTeamToUpdate = await this.gateway.findUserTeam({
          id_user: id_user_to_update,
          id_team
        });
      } else {
        this.gateway.loggerInfo(
          'Parâmetros insuficientes para identificar o relacionamento'
        );
        return this.presenter.badRequest(
          'Informe o ID ou id_user_to_update e id_team'
        );
      }

      if (!userTeamToUpdate) {
        this.gateway.loggerInfo('Relacionamento user-team não encontrado');
        return this.presenter.notFound(
          'Relacionamento user-team não encontrado'
        );
      }

      const team = await this.gateway.findTeam({
        id: userTeamToUpdate.id_team,
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

      const canUpdate = await this.gateway.canUpdateUserTeam(
        userTeamToUpdate,
        requestingUser,
        input
      );

      if (!canUpdate.canUpdate) {
        this.gateway.loggerInfo(
          'Usuário sem permissão para atualizar o relacionamento',
          {
            id_user
          }
        );
        return this.presenter.forbidden(
          canUpdate.message ||
            'Sem permissão para atualizar este relacionamento'
        );
      }

      const updateData: Partial<InputUpdateUserTeam> = {};

      if (role_in_team !== undefined) {
        updateData.role_in_team = role_in_team;
      }

      if (Object.keys(updateData).length === 0) {
        this.gateway.loggerInfo('Nenhum dado para atualizar');
        return this.presenter.badRequest('Nenhum dado para atualizar');
      }

      const success = await this.gateway.updateUserTeam(updateData, {
        id: userTeamToUpdate.id
      });

      if (!success) {
        this.gateway.loggerError('Falha ao atualizar relacionamento user-team');
        return this.presenter.serverError(
          'Falha ao atualizar relacionamento user-team'
        );
      }

      const updatedUserTeam = await this.gateway.findUserTeam({
        id: userTeamToUpdate.id
      });

      this.gateway.loggerInfo(
        'Relacionamento user-team atualizado com sucesso'
      );

      return this.presenter.ok(updatedUserTeam?.toJSON());
    } catch (error) {
      this.gateway.loggerError('Erro ao atualizar relacionamento user-team', {
        error
      });
      return this.presenter.serverError(
        'Erro ao atualizar relacionamento user-team'
      );
    }
  }
}
