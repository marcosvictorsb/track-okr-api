import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { IPresenter } from '@protocols/presenter';
import { UserEntity } from '../entity/user.entity';
import { CheckUserActiveInteractor } from '../usecases/check.user.active.interactor';
import { FindUserCriteria, IUserRepository } from './default.interfaces';

export interface InputCheckUserActive {
  id_user: number;
  id_company: number;
}

export interface OutputCheckUserActive {
  userActive: boolean;
  user?: UserEntity;
}

export interface ICheckUserActiveGateway {
  findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined>;
  loggerInfo(message: string, meta?: DataLogOutput): void;
  loggerError(message: string, meta?: DataLogOutput): void;
}

export interface CheckUserActiveInteractorDependencies {
  gateway: ICheckUserActiveGateway;
  presenter: IPresenter;
}

export interface CheckUserActiveControllerDependencies {
  interactor: CheckUserActiveInteractor;
}

export interface ICheckUserActiveGatewayDependencies {
  userRepository: IUserRepository;
  logging: typeof logger;
}
