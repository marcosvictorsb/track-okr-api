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

      const { kr_id, period, id_company, id_user, year } = input;

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
        startPeriod: this.getStartPeriod(period, year),
        endPeriod: this.getEndPeriod(period, year)
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

  private getStartPeriod(period: string, year: number): Date {
    const currentYear = year;
    const monthMap: { [key: string]: number } = {
      Janeiro: 0,
      Fevereiro: 1,
      Março: 2,
      Abril: 3,
      Maio: 4,
      Junho: 5,
      Julho: 6,
      Agosto: 7,
      Setembro: 8,
      Outubro: 9,
      Novembro: 10,
      Dezembro: 11
    };

    const month = monthMap[period];
    return new Date(currentYear, month, 1, 0, 0, 0, 0);
  }

  private getEndPeriod(period: string, year: number): Date {
    const currentYear = year;
    const monthMap: { [key: string]: number } = {
      Janeiro: 0,
      Fevereiro: 1,
      Março: 2,
      Abril: 3,
      Maio: 4,
      Junho: 5,
      Julho: 6,
      Agosto: 7,
      Setembro: 8,
      Outubro: 9,
      Novembro: 10,
      Dezembro: 11
    };

    const month = monthMap[period];

    return new Date(currentYear, month + 1, 0, 23, 59, 59, 999);
  }
}
