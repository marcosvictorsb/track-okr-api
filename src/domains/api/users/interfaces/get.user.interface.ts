import { IPresenter } from '@protocols/presenter';
import { FindUserCriteria, IUserRepository } from './default.interfaces';
import { DataLogOutput } from '@adapters/services';
import { UserEntity } from '../entity/user.entity';
import { GetUserGateway } from '../gateways/get.user.gateway';
import { GetUserInteractor } from '../usecases/get.user.interactor';
import { GetUserTeamInteractor } from '@domains/common/user-teams/usecases';
import { logger } from '@configs/logger';
import { IUserTeamRepository } from '@domains/common/user-teams/interfaces/default.interfaces';
import { IProfileRepository } from '@domains/api/profile/interfaces';

export type InputGetUser = {
  id_company: number;
  id_user: number;
  limite?: number;
  status?: string;
  role?: string;
};

export type GetUserInteractorDependencies = {
  gateway: GetUserGateway;
  presenter: IPresenter;
  getUserTeamInteractor: GetUserTeamInteractor;
};

export type IGetUserGatewayDependencies = {
  userRepository: IUserRepository;
  userTeamRepository: IUserTeamRepository;
  profileRepository: IProfileRepository;
  logging: typeof logger;
};

export type GetUserControllerDependencies = {
  interactor: GetUserInteractor;
};

export interface IGetUserGateway {
  findUsers(criteria: FindUserCriteria): Promise<UserEntity[] | undefined>;
  findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}
