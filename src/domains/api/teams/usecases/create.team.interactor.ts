import { HttpResponse } from '@protocols/http';
import {
  CreateTeamInteractorDependencies,
  InputCreateTeam,
  ICreateTeamGateway,
  AMOUNT_USERS_DEFAULT
} from '../interfaces';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';

export class CreateTeamInteractor {
  protected gateway: ICreateTeamGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: CreateTeamInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  async execute(input: InputCreateTeam): Promise<HttpResponse> {
    try {
      const { name, description, id_company, id_user } = input;
      this.gateway.loggerInfo('Iniciando criação do time', {
        data: JSON.stringify({
          name,
          description,
          id_company
        })
      });

      // Validar usuário e empresa
      const validation = await this.userCompanyValidator.execute({
        id_user,
        id_company
      });

      if (!validation.isValid) {
        this.gateway.loggerInfo('Usuário ou empresa inválidos', {
          id_user,
          id_company
        });
        return this.presenter.badRequest('Usuário ou empresa inválidos');
      }

      const criteria = {
        name,
        description,
        amount_users: AMOUNT_USERS_DEFAULT,
        id_company
      };
      const team = await this.gateway.createTeam(criteria);
      this.gateway.loggerInfo('Time criado com sucesso');

      return this.presenter.created(team);
    } catch (error) {
      this.gateway.loggerError('Erro ao criar o time', { error });
      return this.presenter.serverError('Erro ao criar o time');
    }
  }
}
