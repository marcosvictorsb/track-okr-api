import {
  CreateSettingInteractorDependencies,
  InputCreateSetting,
  ICreateSettingGateway
} from './interfaces/create.setting.interface';

export class CreateSettingInteractor {
  protected gateway: ICreateSettingGateway;

  constructor(params: CreateSettingInteractorDependencies) {
    this.gateway = params.gateway;
  }

  async execute(input: InputCreateSetting): Promise<boolean> {
    try {
      const {
        block_okr_creation,
        block_key_result_creation,
        block_okr_editing,
        block_key_result_editing,
        allowed_quarters,
        current_quarter_only,
        id_company
      } = input;

      this.gateway.loggerInfo('Iniciando criação das configurações', {
        id_company,
        requestTxt: JSON.stringify(input)
      });

      // Verificar se já existe configuração para a empresa
      const existingSetting = await this.gateway.findSetting({ id_company });
      if (existingSetting) {
        this.gateway.loggerInfo('Configuração já existe para esta empresa', {
          id_company,
          setting_id: existingSetting.id
        });
        return false;
      }

      // Criar configuração com valores padrão se não informados
      // Para novos usuários, iniciar com tudo bloqueado (true)
      const settingData = {
        block_okr_creation: block_okr_creation ?? true,
        block_key_result_creation: block_key_result_creation ?? true,
        block_okr_editing: block_okr_editing ?? true,
        block_key_result_editing: block_key_result_editing ?? true,
        allowed_quarters: allowed_quarters ?? [1, 2, 3, 4],
        current_quarter_only: current_quarter_only ?? true,
        id_company
      };

      const setting = await this.gateway.createSetting(settingData);
      this.gateway.loggerInfo('Configuração criada com sucesso', {
        setting_id: setting.id,
        id_company
      });

      return true;
    } catch (error) {
      this.gateway.loggerError('Erro ao criar as configurações', {
        error: (error as Error).message,
        id_company: input.id_company
      });
      return false;
    }
  }
}
