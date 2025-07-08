import { HttpResponse } from '@protocols/http';
import {
  UpdateUserInteractorDependencies,
  InputUpdateUser,
  IUpdateUserGateway
} from '../interfaces';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserModelAttributes } from '../model/user.model';
import { ManageUserTeamInteractor } from '@domains/common/user-teams/usecases';

export class UpdateUserInteractor {
  protected gateway: IUpdateUserGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;
  protected manageUserTeamInteractor: ManageUserTeamInteractor;

  constructor(params: UpdateUserInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
    this.manageUserTeamInteractor = params.manageUserTeamInteractor;
  }

  async execute(input: InputUpdateUser): Promise<HttpResponse> {
    try {
      const { id, name, email, role, teamId, id_company, id_user } = input;

      this.gateway.loggerInfo('Iniciando atualização do usuário', {
        data: JSON.stringify(input)
      });

      // 1. Validar usuário e empresa
      const validation = await this.userCompanyValidator.execute({
        id_user,
        id_company
      });

      if (!validation.isValid) {
        this.gateway.loggerError('O usuário ou empresa não é válido', {
          id_company,
          id_user
        });
        return this.presenter.badRequest('O usuário ou empresa não é válido');
      }

      // 3. Buscar o usuário a ser atualizado
      const userToUpdate = await this.gateway.findUser({
        id,
        id_company
      });
      if (!userToUpdate) {
        this.gateway.loggerInfo('Usuário a ser atualizado não encontrado', {
          data: JSON.stringify({ id, id_company })
        });
        return this.presenter.notFound(
          'Usuário a ser atualizado não encontrado'
        );
      }

      const updateData: Partial<InputUpdateUser> = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (role !== undefined) updateData.role = role;
      if (typeof teamId === 'number') updateData.teamId = teamId;

      if (Object.keys(updateData).length === 0) {
        return this.presenter.badRequest(
          'Nenhum dado fornecido para atualização'
        );
      }

      const requestingUser = validation.user;
      const canUpdate = await this.gateway.canUpdateUser(
        userToUpdate,
        requestingUser as UserModelAttributes,
        updateData
      );
      if (!canUpdate.canUpdateUser) {
        this.gateway.loggerInfo('Sem permissão para atualizar o usuário', {
          data: JSON.stringify({
            id,
            requesting_user: id_user,
            message: canUpdate.message
          })
        });
        return this.presenter.forbidden(
          canUpdate.message || 'Sem permissão para atualizar este usuário'
        );
      }

      // 6. Atualizar o usuário
      const updateCriteria = {
        ...updateData
      };

      const updated = await this.gateway.updateUser(updateCriteria, { id });

      if (!updated) {
        this.gateway.loggerError('Erro ao atualizar o usuário', {
          data: JSON.stringify({ id })
        });
        return this.presenter.serverError('Erro ao atualizar o usuário');
      }

      const { action } = await this.manageUserTeamInteractor.execute({
        id_user_to_manage: id,
        id_team: teamId,
        id_company: id_company
      });
      this.gateway.loggerInfo(`Ação realizada: ${action}`, {
        id_user_to_manage: id,
        id_team: teamId,
        action
      });
      return this.presenter.noContent();
    } catch (error) {
      this.gateway.loggerError('Erro ao atualizar o usuário', {
        error: String(error)
      });
      return this.presenter.serverError('Erro ao atualizar o usuário');
    }
  }
}
