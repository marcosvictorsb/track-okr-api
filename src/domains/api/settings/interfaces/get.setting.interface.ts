import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { IUserRepository } from '@domains/api/users/interfaces';
import { IPresenter } from '@protocols/presenter';
import { SettingEntity } from '../entity/setting.entity';
import { FindSettingCriteria, ISettingRepository } from './default.interfaces';

export type InputGetSetting = {
  id_company: number;
  id_user: number;
};

export type GetSettingInteractorDependencies = {
  gateway: IGetSettingGateway;
  presenter: IPresenter;
};

export type IGetSettingGatewayDependencies = {
  settingRepository: ISettingRepository;
  userRepository: IUserRepository;
  logging: typeof logger;
};

export type GetSettingControllerDependencies = {
  interactor: {
    execute(
      input: InputGetSetting
    ): Promise<import('@protocols/http').HttpResponse>;
  };
};

export interface IGetSettingGateway {
  findSetting(
    criteria: FindSettingCriteria
  ): Promise<SettingEntity | undefined>;
  findUser(
    criteria: import('@domains/api/users/interfaces').FindUserCriteria
  ): Promise<
    import('@domains/api/users/entity/user.entity').UserEntity | undefined
  >;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}
