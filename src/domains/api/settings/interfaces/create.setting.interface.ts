import { IPresenter } from '@protocols/presenter';
import { HttpResponse } from '@protocols/http';
import { SettingEntity } from '../entity/setting.entity';
import { DataLogOutput } from '@adapters/services';

export type InputCreateSetting = {
  block_okr_creation?: boolean;
  block_key_result_creation?: boolean;
  block_okr_editing?: boolean;
  block_key_result_editing?: boolean;
  allowed_quarters?: number[];
  current_quarter_only?: boolean;
  id_user: number;
  id_company: number;
};

export type CreateSettingCriteria = {
  block_okr_creation?: boolean;
  block_key_result_creation?: boolean;
  block_okr_editing?: boolean;
  block_key_result_editing?: boolean;
  allowed_quarters?: number[];
  current_quarter_only?: boolean;
  id_company: number;
};

export type UpdateSettingCriteria = {
  id: number;
  block_okr_creation?: boolean;
  block_key_result_creation?: boolean;
  block_okr_editing?: boolean;
  block_key_result_editing?: boolean;
  allowed_quarters?: number[];
  current_quarter_only?: boolean;
};

export type FindUserCriteria = {
  id: number;
};

export interface ICreateSettingGateway {
  findUser(
    criteria: FindUserCriteria
  ): Promise<
    import('@domains/api/users/entity/user.entity').UserEntity | undefined
  >;
  findSettingByCompany(criteria: {
    id_company: number;
  }): Promise<SettingEntity | undefined>;
  createSetting(data: CreateSettingCriteria): Promise<SettingEntity>;
  updateSetting(data: UpdateSettingCriteria): Promise<SettingEntity>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export type CreateSettingInteractorDependencies = {
  gateway: ICreateSettingGateway;
  presenter: IPresenter;
};

export type CreateSettingControllerDependencies = {
  interactor: {
    execute(input: InputCreateSetting): Promise<HttpResponse>;
  };
};
