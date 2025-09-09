import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import {
  InputGetAnnualPlanning,
  IGetAnnualPlanningGateway,
  GetAnnualPlanningInteractorDependencies,
  OutputGetAnnualPlanning
} from '../interfaces/get.annual.planning.interface';
import { HttpResponse } from '@protocols/http';

export class GetAnnualPlanningInteractor {
  private gateway: IGetAnnualPlanningGateway;
  private presenter: IPresenter;
  private userCompanyValidator: UserCompanyValidationInteractor;

  constructor(dependencies: GetAnnualPlanningInteractorDependencies) {
    this.gateway = dependencies.gateway;
    this.presenter = dependencies.presenter;
    this.userCompanyValidator = dependencies.userCompanyValidator;
  }

  async execute(input: InputGetAnnualPlanning): Promise<HttpResponse> {
    try {
      const { id_company, id_user, year, quarter } = input;

      this.gateway.loggerInfo('Iniciando busca de planejamentos anuais', {
        id_company,
        id_user,
        year,
        quarter
      });

      // Validar usuário e empresa
      const isValidUser = await this.validateUserAndCompany(
        id_user,
        id_company
      );
      if (!isValidUser) {
        this.gateway.loggerError('Usuário ou empresa inválidos', {
          id_user,
          id_company
        });
        return this.presenter.badRequest('Usuário ou empresa inválidos');
      }

      // Buscar planejamentos anuais com estatísticas
      const plannings = await this.gateway.getAnnualPlannings(
        year,
        quarter,
        id_company
      );

      const output: OutputGetAnnualPlanning = {
        plannings,
        totalPlannings: plannings.length,
        year,
        quarter
      };

      this.gateway.loggerInfo('Planejamentos anuais retornados com sucesso', {
        count: output.totalPlannings,
        year,
        quarter,
        id_company
      });

      return this.presenter.ok(output);
    } catch (error) {
      this.gateway.loggerError('Erro ao buscar planejamentos anuais', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        input: JSON.stringify(input)
      });

      return this.presenter.serverError(
        'Erro interno do servidor ao buscar planejamentos anuais'
      );
    }
  }

  private async validateUserAndCompany(
    id_user: number,
    id_company: number
  ): Promise<boolean> {
    const validation = await this.userCompanyValidator.execute({
      id_user,
      id_company
    });

    if (!validation.isValid) {
      this.gateway.loggerInfo('Usuário ou empresa inválidos', {
        id_user,
        id_company
      });
      return false;
    }

    return true;
  }
}
