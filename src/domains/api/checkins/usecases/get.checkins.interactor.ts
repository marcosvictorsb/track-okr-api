import { MixGetCheckinsHistory } from '@adapters/gateways/api/result-key';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  IGetCheckinsGateway,
  IGetCheckinsInteractor,
  IGetCheckinsInteractorDependencies,
  InputGetCheckins
} from '../interfaces/get.checkins.interface';

export class GetCheckinsInteractor
  extends MixGetCheckinsHistory
  implements IGetCheckinsInteractor
{
  protected gateway: IGetCheckinsGateway;
  protected presenter: IPresenter;

  constructor(params: IGetCheckinsInteractorDependencies) {
    super(params);
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  public async execute(input: InputGetCheckins): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo(
        'Iniciando busca de atualizações do resultado-chave',
        {
          requestTxt: JSON.stringify(input)
        }
      );
      const { id_result_key } = input;

      const historyUpdates = await this.gateway.findUpdatesByResultKey({
        id_result_key
      });

      if (!historyUpdates || historyUpdates.length === 0) {
        this.gateway.loggerInfo(
          'Nenhuma atualização encontrada para o resultado-chave',
          {
            id_result_key
          }
        );
        return this.presenter.ok([]);
      }

      this.gateway.loggerInfo(
        'Atualizações do resultado-chave encontradas com sucesso',
        {
          count: historyUpdates.length,
          id_result_key
        }
      );

      return this.presenter.ok(historyUpdates);
    } catch (error) {
      this.gateway.loggerError(
        'Erro ao buscar atualizações do resultado-chave',
        {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          requestTxt: JSON.stringify(input)
        }
      );

      return this.presenter.serverError(
        'Erro ao buscar atualizações do resultado-chave'
      );
    }
  }
}
