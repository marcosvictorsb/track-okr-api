import { HttpResponse } from '@protocols/http';
import {
  IObjectiveGateway,
  CreateObjectiveInteractorDependencies,
  InputCreateObjective
} from '@domains/api/objectives/interfaces';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';

export class CreateObjectiveInteractor {
  protected gateway: IObjectiveGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: CreateObjectiveInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  public async execute(input: InputCreateObjective): Promise<HttpResponse> {
    try {
      const {
        title,
        description,
        id_team,
        quarter,
        year,
        id_company,
        id_user
      } = input;

      // Log início da operação
      this.gateway.loggerInfo('Iniciando criação do objetivo', {
        requestTxt: JSON.stringify(input)
      });

      // Validar usuário e empresa
      const validation = await this.userCompanyValidator.execute({
        id_user,
        id_company
      });

      if (!validation.isValid) {
        console.log('Usuário ou empresa inválidos', {
          id_user,
          id_company
        });
        return this.presenter.badRequest('Usuário ou empresa inválidos');
      }

      // Validar se o quarter está entre 1 e 4
      if (quarter < 1 || quarter > 4) {
        return this.presenter.badRequest('Quarter must be between 1 and 4');
      }

      // Validar se o ano é válido
      const currentYear = new Date().getFullYear();
      if (year < 2020 || year > currentYear + 10) {
        return this.presenter.badRequest('Invalid year');
      }

      const objective = await this.gateway.create({
        title,
        description,
        id_team,
        quarter,
        year,
        status: 'active'
      });

      this.gateway.loggerInfo('Objetivo criado com sucesso');
      return this.presenter.created(objective);
    } catch (error) {
      console.error('Erro ao criar o objetivo', { error });
      return this.presenter.serverError('Erro ao criar o objetivo');
    }
  }
}
