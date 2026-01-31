import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { UserEntity } from '../entity/user.entity';
import {
  DeleteUserCriteria,
  FindUserCriteria,
  IUserRepository
} from './default.interfaces';

export type InputDeleteUser = {
  id_user_to_delete: number;
  id_company: number;
  id_user: number;
};

export type DeleteUserInteractorDependencies = {
  gateway: IDeleteUserGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export type DeleteUserControllerDependencies = {
  interactor: {
    execute(input: InputDeleteUser): Promise<HttpResponse>;
  };
};

export interface IDeleteUserGateway {
  findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined>;
  deleteUser(criteria: DeleteUserCriteria): Promise<boolean>;
  canDeleteUser(
    userToDelete: UserEntity,
    requestingUser: UserEntity
  ): Promise<{ canDeleteUser: boolean; message?: string }>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IDeleteUserGatewayDependencies {
  userRepository: IUserRepository;
  logging: typeof logger;
}
