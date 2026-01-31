import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { IObjectiveRepository } from '@domains/api/objectives/interfaces';
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
  DeletePlannerCriteria,
  FindPlannerCriteria,
  IPlannerRepository
} from './default.interfaces';

export type InputDeletePlanner = {
  id: number;
  id_company: number;
  id_user: number;
};

export type DeletePlannerInteractorDependencies = {
  gateway: IDeletePlannerGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
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
  hasRelatedObjectives(plannerId: number): Promise<boolean>;
  deletePlanner(criteria: DeletePlannerCriteria): Promise<boolean>;
  findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IDeletePlannerGatewayDependencies {
  objectiveRepository: IObjectiveRepository;
  plannerRepository: IPlannerRepository;
  userRepository: IUserRepository;
  logging: typeof logger;
}

export declare class DeletePlannerInteractor {
  execute(input: InputDeletePlanner): Promise<HttpResponse>;
}
