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

export type InputDeactivateUser = {
  id_user_to_deactivate: number;
  id_company: number;
  id_user: number;
};

export type DeactivateUserInteractorDependencies = {
  gateway: IDeactivateUserGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export type DeactivateUserControllerDependencies = {
  interactor: {
    execute(input: InputDeactivateUser): Promise<HttpResponse>;
  };
};

export interface IDeactivateUserGateway {
  findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined>;
  deactivateUser(criteria: UpdateUserCriteria): Promise<boolean>;
  canDeactivateUser(
    userToDeactivate: UserEntity,
    requestingUser: UserEntity
  ): Promise<{ canDeactivateUser: boolean; message?: string }>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IDeactivateUserGatewayDependencies {
  userRepository: IUserRepository;
  logging: typeof logger;
}
