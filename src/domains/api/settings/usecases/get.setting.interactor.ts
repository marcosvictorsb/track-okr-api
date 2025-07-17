import { HttpResponse } from '@protocols/http';
import {
  FindSettingCriteria,
  GetSettingInteractorDependencies,
  InputGetSetting,
  IGetSettingGateway
} from '../interfaces';
import { IPresenter } from '@protocols/presenter';

export class GetSettingInteractor {
  protected gateway: IGetSettingGateway;
  protected presenter: IPresenter;

  constructor(params: GetSettingInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  async execute(input: InputGetSetting): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo(
        'Iniciando a busca das configurações da empresa',
        {
          requestTxt: JSON.stringify(input)
        }
      );
      const { id_user, id_company } = input;

      const user = await this.gateway.findUser({ id: id_user });
      if (user && user.id_company !== id_company) {
        this.gateway.loggerInfo('Usuário não pertence a empresa informada', {
          id_user: id_user,
          id_company: id_company
        });
        return this.presenter.forbidden(
          'Usuário não pertence a empresa informada'
        );
      }

      const criteria: FindSettingCriteria = { id_company };
      const setting = await this.gateway.findSetting(criteria);
      if (!setting) {
        this.gateway.loggerInfo(
          'Nenhuma configuração encontrada para a empresa'
        );
        // Retornar configuração padrão se não existir
        const defaultSetting = {
          block_okr_creation: false,
          block_key_result_creation: false,
          block_okr_editing: false,
          block_key_result_editing: false,
          allowed_quarters: [1, 2, 3, 4],
          current_quarter_only: false,
          id_company
        };
        return this.presenter.ok(defaultSetting);
      }

      this.gateway.loggerInfo('Configuração encontrada com sucesso');
      return this.presenter.ok(setting);
    } catch (error) {
      this.gateway.loggerError('Erro ao buscar as configurações da empresa', {
        error
      });
      return this.presenter.serverError(
        'Erro ao buscar as configurações da empresa'
      );
    }
  }
}
