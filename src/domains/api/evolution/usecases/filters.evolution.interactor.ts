import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  FiltersEvolutionInteractorDependencies,
  IFiltersEvolutionGateway,
  InputFiltersEvolution
} from '../interfaces/filters.evolution.interface';

export class FiltersEvolutionInteractor {
  protected gateway: IFiltersEvolutionGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: FiltersEvolutionInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  public async execute(input: InputFiltersEvolution): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Buscando as informação para o filtro', {
        requestTxt: JSON.stringify(input)
      });

      const { id_company, id_user } = input;

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

      const yearByObjectives =
        await this.gateway.getYearByObjectives(id_company);

      const teams = await this.gateway.getTeamsByCompany(id_company);
      const responsibles =
        await this.gateway.findResponsiblesByCompany(id_company);

      this.gateway.loggerInfo('Evolução de OKRs encontrada com sucesso');
      return this.presenter.ok({
        available_years: yearByObjectives,
        available_teams: teams,
        available_responsibles: responsibles
      });
    } catch (error) {
      this.gateway.loggerError('Erro ao buscar evolução de OKRs', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        id_company: input.id_company
      });
      return this.presenter.serverError('Erro ao buscar evolução de OKRs');
    }
  }
}
