import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  FindUserCriteria,
  IUserRepository
} from '@domains/api/users/interfaces/default.interfaces';
import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { PlannerEntity } from '../entity/planner.entity';
import {
  FindPlannerCriteria,
  IPlannerRepository,
  UpdatePlannerCriteria
} from './default.interfaces';

export type InputUpdatePlanner = {
  id: number;
  title: string;
  description: string;
  year: number;
  id_company: number;
  id_user: number;
};

export type UpdatePlannerInteractorDependencies = {
  gateway: IUpdatePlannerGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export type UpdatePlannerControllerDependencies = {
  interactor: {
    execute(input: InputUpdatePlanner): Promise<HttpResponse>;
  };
};

export interface IUpdatePlannerGateway {
  findPlanner(
    criteria: FindPlannerCriteria
  ): Promise<PlannerEntity | undefined>;
  updatePlanner(
    criteria: UpdatePlannerCriteria,
    data: Partial<PlannerEntity>
  ): Promise<boolean>;
  findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IUpdatePlannerGatewayDependencies {
  plannerRepository: IPlannerRepository;
  userRepository: IUserRepository;
  logging: typeof logger;
}

export declare class UpdatePlannerInteractor {
  execute(input: InputUpdatePlanner): Promise<HttpResponse>;
}
