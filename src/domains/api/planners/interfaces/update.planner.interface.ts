import { IPresenter } from '@protocols/presenter';
import { PlannerEntity } from '../entity/planner.entity';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  IPlannerRepository,
  FindPlannerCriteria,
  UpdatePlannerCriteria
} from './default.interfaces';
import {
  IUserRepository,
  FindUserCriteria
} from '@domains/api/users/interfaces/default.interfaces';
import { DataLogOutput } from '@adapters/services';
import { HttpResponse } from '@protocols/http';
import { logger } from '@configs/logger';

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

// Forward declaration to avoid circular dependency
export declare class UpdatePlannerInteractor {
  execute(input: InputUpdatePlanner): Promise<HttpResponse>;
}
