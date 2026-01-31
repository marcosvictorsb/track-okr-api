import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  FindUserCriteria,
  IUserRepository
} from '@domains/api/users/interfaces';
import { UserCompanyValidationInteractor } from '@domains/common';
import { ICheckCompanyFeatureLimitsInteractor } from '@domains/common/validations/interfaces/check.company.feature.limits.interface';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { TeamEntity } from '../entity/team.entity';
import { CreateTeamCriteria, ITeamRepository } from './default.interfaces';

export type InputCreateTeam = {
  name: string;
  description: string;
  id_company: number;
  id_user: number;
};

export type CreateTeamInteractorDependencies = {
  gateway: ICreateTeamGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
  checkCompanyFeatureLimits: ICheckCompanyFeatureLimitsInteractor;
};

export type ICreateTeamGatewayDependencies = {
  teamRepository: ITeamRepository;
  userRepository: IUserRepository;
  logging: typeof logger;
};

export type CreateTeamControllerDependencies = {
  interactor: {
    execute(input: InputCreateTeam): Promise<HttpResponse>;
  };
};

export interface ICreateTeamGateway {
  findTeam(criteria: CreateTeamCriteria): Promise<TeamEntity | undefined>;
  createTeam(data: CreateTeamCriteria): Promise<TeamEntity>;
  findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}
