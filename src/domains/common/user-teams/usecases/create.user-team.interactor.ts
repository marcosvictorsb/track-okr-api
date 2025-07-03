import { HttpResponse } from '@protocols/http';
import {
  CreateUserTeamInteractorDependencies,
  InputCreateUserTeam,
  ICreateUserTeamGateway
} from '../interfaces';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';

export class CreateUserTeamInteractor {
  protected gateway: ICreateUserTeamGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: CreateUserTeamInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  async execute(input: InputCreateUserTeam): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Iniciando adição de usuário ao time', {
        requestTxt: JSON.stringify(input)
      });

      const { id_user_to_add, id_team, id_company, id_user, role_in_team } =
        input;

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

      // Buscar o usuário a ser adicionado
      const userToAdd = await this.gateway.findUser({
        id: id_user_to_add,
        id_company
      });

      if (!userToAdd) {
        this.gateway.loggerInfo('Usuário a ser adicionado não encontrado', {
          id_user_to_add: id_user_to_add,
          id_company: id_company
        });
        return this.presenter.notFound('Usuário não encontrado');
      }

      // Buscar o time
      const team = await this.gateway.findTeam({
        id: id_team,
        id_company
      });

      if (!team) {
        this.gateway.loggerInfo('Time não encontrado', {
          id_team: id_team,
          id_company: id_company
        });
        return this.presenter.notFound('Time não encontrado');
      }

      // Verificar permissões
      const canManage = await this.gateway.canManageTeam(requestingUser, team);
      if (!canManage.canManage) {
        this.gateway.loggerInfo('Usuário sem permissão para gerenciar o time', {
          id_user: id_user,
          id_team: id_team,
          requestTxt: canManage.message
        });
        return this.presenter.forbidden(
          canManage.message || 'Sem permissão para gerenciar o time'
        );
      }

      // Verificar se o usuário já está no time
      const existingRelation = await this.gateway.findUserTeam({
        id_user: id_user_to_add,
        id_team
      });

      if (existingRelation) {
        this.gateway.loggerInfo('Usuário já está no time', {
          id_user_to_add: id_user_to_add,
          id_team: id_team
        });
        return this.presenter.conflict('Usuário já está no time');
      }

      // Criar o relacionamento
      const userTeam = await this.gateway.createUserTeam({
        id_user: id_user_to_add,
        id_team,
        role_in_team: role_in_team || 'member'
      });

      this.gateway.loggerInfo('Usuário adicionado ao time com sucesso', {
        userTeamId: userTeam.id,
        id_user_to_add: id_user_to_add,
        id_team: id_team
      });

      return this.presenter.created(userTeam.toJSON());
    } catch (error) {
      this.gateway.loggerError('Erro ao adicionar usuário ao time', { error });
      return this.presenter.serverError('Erro ao adicionar usuário ao time');
    }
  }
}
