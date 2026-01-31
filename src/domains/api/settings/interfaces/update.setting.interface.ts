import { DataLogOutput } from '@adapters/services';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { SettingEntity } from '../entity/setting.entity';

export type InputUpdateSetting = {
  id: number;
  block_okr_creation?: boolean;
  block_key_result_creation?: boolean;
  block_okr_editing?: boolean;
  block_key_result_editing?: boolean;
  allowed_quarters?: number[];
  current_quarter_only?: boolean;
  id_user: number;
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

export interface IUpdateSettingGateway {
  findUser(
    criteria: FindUserCriteria
  ): Promise<
    import('@domains/api/users/entity/user.entity').UserEntity | undefined
  >;
  findSetting(criteria: { id: number }): Promise<SettingEntity | undefined>;
  updateSetting(data: UpdateSettingCriteria): Promise<SettingEntity>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export type UpdateSettingInteractorDependencies = {
  gateway: IUpdateSettingGateway;
  presenter: IPresenter;
};

export type UpdateSettingControllerDependencies = {
  interactor: {
    execute(input: InputUpdateSetting): Promise<HttpResponse>;
  };
};
