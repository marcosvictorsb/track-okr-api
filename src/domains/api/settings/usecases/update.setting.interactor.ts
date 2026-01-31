import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  InputUpdateSetting,
  IUpdateSettingGateway,
  UpdateSettingCriteria,
  UpdateSettingInteractorDependencies
} from '../interfaces/update.setting.interface';

export class UpdateSettingInteractor {
  protected gateway: IUpdateSettingGateway;
  protected presenter: IPresenter;

  constructor(params: UpdateSettingInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  async execute(input: InputUpdateSetting): Promise<HttpResponse> {
    try {
      const {
        id,
        block_okr_creation,
        block_key_result_creation,
        block_okr_editing,
        block_key_result_editing,
        allowed_quarters,
        current_quarter_only,
        id_user,
        id_company
      } = input;

      this.gateway.loggerInfo('Iniciando atualização das configurações', {
        setting_id: id,
        id_user,
        id_company,
        requestTxt: JSON.stringify(input)
      });

      const user = await this.gateway.findUser({ id: id_user });
      if (!user) {
        this.gateway.loggerError('Usuário não encontrado', {
          id_user,
          setting_id: id
        });
        return this.presenter.badRequest('Usuário não encontrado');
      }

      if (user.id_company !== id_company) {
        this.gateway.loggerError('Usuário não pertence à empresa informada', {
          id_user,
          id_company,
          id_user_company: user.id_company,
          setting_id: id
        });
        return this.presenter.forbidden(
          'Usuário não pertence à empresa informada'
        );
      }

      const existingSetting = await this.gateway.findSetting({ id });
      if (!existingSetting) {
        this.gateway.loggerError('Configuração não encontrada', {
          setting_id: id,
          id_company
        });
        return this.presenter.notFound('Configuração não encontrada');
      }

      if (existingSetting.id_company !== id_company) {
        this.gateway.loggerError(
          'Configuração não pertence à empresa do usuário',
          {
            setting_id: id,
            id_company
          }
        );
        return this.presenter.forbidden(
          'Configuração não pertence à empresa informada'
        );
      }

      const updateData: UpdateSettingCriteria = { id };

      if (block_okr_creation !== undefined)
        updateData.block_okr_creation = block_okr_creation;
      if (block_key_result_creation !== undefined)
        updateData.block_key_result_creation = block_key_result_creation;
      if (block_okr_editing !== undefined)
        updateData.block_okr_editing = block_okr_editing;
      if (block_key_result_editing !== undefined)
        updateData.block_key_result_editing = block_key_result_editing;
      if (allowed_quarters !== undefined)
        updateData.allowed_quarters = allowed_quarters;
      if (current_quarter_only !== undefined)
        updateData.current_quarter_only = current_quarter_only;

      const updatedSetting = await this.gateway.updateSetting(updateData);

      this.gateway.loggerInfo('Configuração atualizada com sucesso', {
        setting_id: updatedSetting.id,
        id_company,
        id_user
      });

      return this.presenter.ok(updatedSetting);
    } catch (error) {
      this.gateway.loggerError('Erro ao atualizar as configurações', {
        error: (error as Error).message,
        setting_id: input.id,
        id_user: input.id_user,
        id_company: input.id_company
      });
      return this.presenter.serverError('Erro ao atualizar as configurações');
    }
  }
}
