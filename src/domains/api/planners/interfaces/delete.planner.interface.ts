import { IPresenter } from '@protocols/presenter';
import { PlannerEntity } from '../entity/planner.entity';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  IPlannerRepository,
  FindPlannerCriteria,
  DeletePlannerCriteria
} from './default.interfaces';
import {
  IUserRepository,
  FindUserCriteria
} from '@domains/api/users/interfaces/default.interfaces';
import { DataLogOutput } from '@adapters/services';
import { HttpResponse } from '@protocols/http';
import { logger } from '@configs/logger';

export type InputDeletePlanner = {
  id: number;
  id_company: number;
  id_user: number;
};

export type DeletePlannerInteractorDependencies = {
  gateway: IDeletePlannerGateway;
  presenter: IPresenter;
};

export type DeletePlannerControllerDependencies = {
  interactor: {
    execute(input: InputDeletePlanner): Promise<HttpResponse>;
  };
};

export interface IDeletePlannerGateway {
  findPlanner(
    criteria: FindPlannerCriteria
  ): Promise<PlannerEntity | undefined>;
  deletePlanner(criteria: DeletePlannerCriteria): Promise<boolean>;
  findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IDeletePlannerGatewayDependencies {
  plannerRepository: IPlannerRepository;
  userRepository: IUserRepository;
  logging: typeof logger;
}

// Forward declaration to avoid circular dependency
export declare class DeletePlannerInteractor {
  execute(input: InputDeletePlanner): Promise<HttpResponse>;
}
