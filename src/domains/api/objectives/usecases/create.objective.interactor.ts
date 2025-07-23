import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import {
  CreateObjectiveInteractorDependencies,
  ICreateObjectiveGateway,
  InputCreateObjective
} from '../interfaces/create.objective.interface';

export class CreateObjectiveInteractor {
  protected gateway: ICreateObjectiveGateway;
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
        id_user,
        id_planner
      } = input;

      this.gateway.loggerInfo('Iniciando criação do objetivo', {
        requestTxt: JSON.stringify(input)
      });

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

      const objective = await this.gateway.create({
        title,
        description,
        id_team,
        quarter,
        year,
        status: 'active',
        id_company,
        id_planner
      });

      this.gateway.loggerInfo('Objetivo criado com sucesso');
      return this.presenter.created(objective);
    } catch (error) {
      this.gateway.loggerError('Erro ao criar o objetivo', { error });
      return this.presenter.serverError('Erro ao criar o objetivo');
    }
  }
}
