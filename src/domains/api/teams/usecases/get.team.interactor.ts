import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  FindTeamCriteria,
  GetTeamInteractorDependencies,
  IGetTeamGateway,
  InputGetTeam
} from '../interfaces';

export class GetTeamInteractor {
  protected gateway: IGetTeamGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: GetTeamInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  async execute(input: InputGetTeam): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Iniciando a busca dos times', {
        input: JSON.stringify(input),
        id_user: input.id_user,
        id_company: input.id_company,
        limit: input.limite,
        data: input.name || 'sem filtro de nome'
      });
      const { id_user, limite, id_company, name } = input;

      // Validar usuário e empresa
      const validation = await this.userCompanyValidator.execute({
        id_user,
        id_company
      });

      if (!validation.isValid) {
        this.gateway.loggerInfo('O usuário ou empresa não é válido', {
          id_company,
          id_user
        });
        return this.presenter.badRequest('O usuário ou empresa não é válido');
      }

      const criteria: FindTeamCriteria = { id_company, limite, name };
      const teams = await this.gateway.findTeam(criteria);
      if (!teams) {
        this.gateway.loggerInfo('Nenhum time encontrado');
        return this.presenter.ok([]);
      }
      return this.presenter.ok(teams);
    } catch (error) {
      this.gateway.loggerError('Erro ao buscar os times', { error });
      return this.presenter.serverError('Erro ao buscar os times');
    }
  }
}
