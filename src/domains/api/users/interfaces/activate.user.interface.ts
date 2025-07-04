import { IPresenter } from '@protocols/presenter';
import { UserEntity } from '../entity/user.entity';
import {
  IUserRepository,
  FindUserCriteria,
  UpdateUserCriteria
} from './default.interfaces';
import { DataLogOutput } from '@adapters/services';
import { HttpResponse } from '@protocols/http';
import { logger } from '@configs/logger';
import { UserCompanyValidationInteractor } from '@domains/common';

export type InputActivateUser = {
  id_user_to_activate: number;
  id_company: number;
  id_user: number;
};

export type ActivateUserInteractorDependencies = {
  gateway: IActivateUserGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export type ActivateUserControllerDependencies = {
  interactor: {
    execute(input: InputActivateUser): Promise<HttpResponse>;
  };
};

export interface IActivateUserGateway {
  findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined>;
  activateUser(criteria: UpdateUserCriteria): Promise<boolean>;
  canActivateUser(
    userToActivate: UserEntity,
    requestingUser: UserEntity
  ): Promise<{ canActivateUser: boolean; message?: string }>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IActivateUserGatewayDependencies {
  userRepository: IUserRepository;
  logging: typeof logger;
}
