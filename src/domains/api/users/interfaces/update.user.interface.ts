import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { UserCompanyValidationInteractor } from '@domains/common';
import { ManageUserTeamInteractor } from '@domains/common/user-teams/usecases';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { UserEntity } from '../entity/user.entity';
import {
  FindUserCriteria,
  IUserRepository,
  UpdateUserCriteria
} from './default.interfaces';

export type InputUpdateUser = {
  id: number;
  name?: string;
  email?: string;
  role?: string;
  teamId?: number;
  id_company: number;
  id_user: number;
};

export type UpdateUserInteractorDependencies = {
  gateway: IUpdateUserGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
  manageUserTeamInteractor: ManageUserTeamInteractor;
};

export type UpdateUserControllerDependencies = {
  interactor: {
    execute(input: InputUpdateUser): Promise<HttpResponse>;
  };
};

export interface IUpdateUserGateway {
  findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined>;
  updateUser(
    data: Partial<UpdateUserCriteria>,
    criteria: UpdateUserCriteria
  ): Promise<boolean>;
  canUpdateUser(
    userToUpdate: UserEntity,
    requestingUser: UserEntity,
    updateData: Partial<InputUpdateUser>
  ): Promise<{ canUpdateUser: boolean; message?: string }>;

  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IUpdateUserGatewayDependencies {
  userRepository: IUserRepository;
  logging: typeof logger;
}
