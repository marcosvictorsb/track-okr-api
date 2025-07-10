import { IPresenter } from '@protocols/presenter';
import {
  IGetKeyResultUpdateGateway,
  IGetKeyResultUpdateInteractor,
  IGetKeyResultUpdateInteractorDependencies,
  InputGetKeyResultUpdate
} from '../interfaces/get-result-key-updates.interface';
// import { UserCompanyValidationInteractor } from '@domains/common';
import { MixGetKeyResultUpdatesHistory } from '@adapters/gateways/api/result-key';
import { HttpResponse } from '@protocols/http';

export class GetKeyResultUpdateInteractor
  extends MixGetKeyResultUpdatesHistory
  implements IGetKeyResultUpdateInteractor
{
  protected gateway: IGetKeyResultUpdateGateway;
  protected presenter: IPresenter;
  // protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: IGetKeyResultUpdateInteractorDependencies) {
    super(params);
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  public async execute(input: InputGetKeyResultUpdate): Promise<HttpResponse> {
    try {
      this.loggerInfo('Iniciando busca de atualizações do resultado-chave', {
        requestTxt: JSON.stringify(input)
      });
      const { id_result_key } = input;

      const historyUpdates = await this.gateway.findUpdatesByResultKey({
        id_result_key
      });

      if (!historyUpdates || historyUpdates.length === 0) {
        this.loggerInfo(
          'Nenhuma atualização encontrada para o resultado-chave',
          {
            id_result_key
          }
        );
        return this.presenter.ok([]);
      }

      this.loggerInfo(
        'Atualizações do resultado-chave encontradas com sucesso',
        {
          count: historyUpdates.length,
          id_result_key
        }
      );

      return this.presenter.ok(historyUpdates);
    } catch (error) {
      this.loggerError('Erro ao buscar atualizações do resultado-chave', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        requestTxt: JSON.stringify(input)
      });

      return this.presenter.serverError(
        'Erro ao buscar atualizações do resultado-chave'
      );
    }
  }
}
