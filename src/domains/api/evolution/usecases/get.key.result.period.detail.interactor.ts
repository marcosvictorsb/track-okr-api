import { FindCheckinsCriteria } from '@domains/api/checkins/interfaces';
import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  GetKeyResultPeriodDetailInteractorDependencies,
  IGetKeyResultPeriodDetailGateway,
  InputGetKeyResultPeriodDetail
} from '../interfaces/get.key.evolution.interface';

export class GetKeyResultPeriodDetailInteractor {
  protected gateway: IGetKeyResultPeriodDetailGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: GetKeyResultPeriodDetailInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  public async execute(
    input: InputGetKeyResultPeriodDetail
  ): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo(
        'Iniciando busca de detalhes do período do key result',
        {
          requestTxt: JSON.stringify(input)
        }
      );

      const { kr_id, period, id_company, id_user } = input;

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

      const criteria: FindCheckinsCriteria = {
        id_result_key: kr_id,
        startPeriod: this.getStartPeriod(period),
        endPeriod: this.getEndPeriod(period)
      };

      const checkins = await this.gateway.getCheckinsByPeriod(criteria);

      this.gateway.loggerInfo('Detalhes do período encontrados com sucesso');
      return this.presenter.ok(checkins);
    } catch (error) {
      this.gateway.loggerError('Erro ao buscar detalhes do período', {
        error: (error as Error).message,
        data: `Key result ${input.kr_id}, período ${input.period}`
      });
      return this.presenter.serverError('Erro ao buscar detalhes do período');
    }
  }

  /**
   * Converte o nome do período para o primeiro dia do mês
   * @param period Nome do mês ('Jan', 'Fev', 'Mar', etc.)
   * @returns Date representando o primeiro dia do mês às 00:00:00
   * @example getStartPeriod('Mar') → 2025-03-01T00:00:00.000Z
   */
  private getStartPeriod(period: string): Date {
    const currentYear = new Date().getFullYear();
    const monthMap: { [key: string]: number } = {
      Jan: 0,
      Fev: 1,
      Mar: 2,
      Abr: 3,
      Mai: 4,
      Jun: 5,
      Jul: 6,
      Ago: 7,
      Set: 8,
      Out: 9,
      Nov: 10,
      Dez: 11
    };

    const month = monthMap[period];
    return new Date(currentYear, month, 1, 0, 0, 0, 0);
  }

  /**
   * Converte o nome do período para o último dia do mês
   * @param period Nome do mês ('Jan', 'Fev', 'Mar', etc.)
   * @returns Date representando o último dia do mês às 23:59:59
   * @example getEndPeriod('Mar') → 2025-03-31T23:59:59.999Z
   */
  private getEndPeriod(period: string): Date {
    const currentYear = new Date().getFullYear();
    const monthMap: { [key: string]: number } = {
      Jan: 0,
      Fev: 1,
      Mar: 2,
      Abr: 3,
      Mai: 4,
      Jun: 5,
      Jul: 6,
      Ago: 7,
      Set: 8,
      Out: 9,
      Nov: 10,
      Dez: 11
    };

    const month = monthMap[period];

    // Retorna o último dia do mês às 23:59:59
    return new Date(currentYear, month + 1, 0, 23, 59, 59, 999);
  }
}
