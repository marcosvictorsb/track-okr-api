import { IPresenter } from '@protocols/presenter';
import {
  CreatePlannerCriteria,
  IPlannerRepository
} from './default.interfaces';
import { DataLogOutput } from '@adapters/services';
import { PlannerEntity } from '../entity/planner.entity';
import { CreatePlannerGateway } from '../gateways/create.planner.gateway';
import { CreatePlannerInteractor } from '../usecases';
import {
  FindUserCriteria,
  IUserRepository
} from '@domains/api/users/interfaces';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { logger } from '@configs/logger';
import { UserCompanyValidationInteractor } from '@domains/common';
import { ICheckCompanyFeatureLimitsInteractor } from '@domains/common/validations/interfaces/check.company.feature.limits.interface';

export type InputCreatePlanner = {
  title: string;
  description: string;
  year: number;
  id_company: number;
  id_user: number;
};

export type CreatePlannerInteractorDependencies = {
  gateway: CreatePlannerGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
  checkCompanyFeatureLimits: ICheckCompanyFeatureLimitsInteractor;
};

export type ICreatePlannerGatewayDependencies = {
  plannerRepository: IPlannerRepository;
  userRepository: IUserRepository;
  logging: typeof logger;
};

export type CreatePlannerControllerDependencies = {
  interactor: CreatePlannerInteractor;
};

export interface ICreatePlannerGateway {
  findPlanner(
    criteria: CreatePlannerCriteria
  ): Promise<PlannerEntity | undefined>;
  createPlanner(data: CreatePlannerCriteria): Promise<PlannerEntity>;
  findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}
