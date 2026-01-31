import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  CreateSettingCriteria,
  CreateSettingInteractorDependencies,
  ICreateSettingGateway,
  InputCreateSetting,
  UpdateSettingCriteria
} from '../interfaces/create.setting.interface';

export class CreateSettingInteractor {
  protected gateway: ICreateSettingGateway;
  protected presenter: IPresenter;

  constructor(params: CreateSettingInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  async execute(input: InputCreateSetting): Promise<HttpResponse> {
    try {
      const {
        block_okr_creation,
        block_key_result_creation,
        block_okr_editing,
        block_key_result_editing,
        allowed_quarters,
        current_quarter_only,
        id_user,
        id_company
      } = input;

      this.gateway.loggerInfo(
        'Iniciando criação/atualização das configurações',
        {
          id_user,
          id_company,
          requestTxt: JSON.stringify(input)
        }
      );

      const user = await this.gateway.findUser({ id: id_user });
      if (!user) {
        this.gateway.loggerError('Usuário não encontrado', {
          id_user
        });
        return this.presenter.badRequest('Usuário não encontrado');
      }

      if (user.id_company !== id_company) {
        this.gateway.loggerError('Usuário não pertence à empresa informada', {
          id_user,
          id_company,
          id_user_company: user.id_company
        });
        return this.presenter.forbidden(
          'Usuário não pertence à empresa informada'
        );
      }

      const existingSetting = await this.gateway.findSettingByCompany({
        id_company
      });

      let resultSetting;

      if (existingSetting) {
        this.gateway.loggerInfo(
          'Configuração existente encontrada, atualizando',
          {
            setting_id: existingSetting.id,
            id_company
          }
        );

        const updateData: UpdateSettingCriteria = { id: existingSetting.id! };

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

        resultSetting = await this.gateway.updateSetting(updateData);

        this.gateway.loggerInfo('Configuração atualizada com sucesso', {
          setting_id: resultSetting.id,
          id_company,
          id_user
        });
      } else {
        this.gateway.loggerInfo('Criando nova configuração para a empresa', {
          id_company
        });

        const createData: CreateSettingCriteria = {
          id_company,
          block_okr_creation: block_okr_creation ?? false,
          block_key_result_creation: block_key_result_creation ?? false,
          block_okr_editing: block_okr_editing ?? false,
          block_key_result_editing: block_key_result_editing ?? false,
          allowed_quarters: allowed_quarters ?? [1, 2, 3, 4],
          current_quarter_only: current_quarter_only ?? false
        };

        resultSetting = await this.gateway.createSetting(createData);

        this.gateway.loggerInfo('Configuração criada com sucesso', {
          setting_id: resultSetting.id,
          id_company,
          id_user
        });
      }

      return this.presenter.ok({
        message: existingSetting
          ? 'Configuração atualizada com sucesso'
          : 'Configuração criada com sucesso',
        setting: resultSetting,
        action: existingSetting ? 'updated' : 'created'
      });
    } catch (error) {
      this.gateway.loggerError('Erro ao criar/atualizar as configurações', {
        error: (error as Error).message,
        id_user: input.id_user,
        id_company: input.id_company
      });
      return this.presenter.serverError('Erro ao processar as configurações');
    }
  }
}
