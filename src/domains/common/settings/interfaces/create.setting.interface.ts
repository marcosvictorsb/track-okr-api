import { SettingEntity } from '@domains/api/settings/entity/setting.entity';
import { DataLogOutput } from '@adapters/services';

export type InputCreateSetting = {
  block_okr_creation?: boolean;
  block_key_result_creation?: boolean;
  block_okr_editing?: boolean;
  block_key_result_editing?: boolean;
  allowed_quarters?: number[];
  current_quarter_only?: boolean;
  id_company: number;
};

export type CreateSettingCriteria = {
  block_okr_creation: boolean;
  block_key_result_creation: boolean;
  block_okr_editing: boolean;
  block_key_result_editing: boolean;
  allowed_quarters: number[];
  current_quarter_only: boolean;
  id_company: number;
};

export interface ICreateSettingGateway {
  findSetting(criteria: {
    id_company: number;
  }): Promise<SettingEntity | undefined>;
  createSetting(data: CreateSettingCriteria): Promise<SettingEntity>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export type CreateSettingInteractorDependencies = {
  gateway: ICreateSettingGateway;
};
