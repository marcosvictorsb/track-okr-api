import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { IUserRepository } from '@domains/api/users/interfaces';
import { IPresenter } from '@protocols/presenter';
import { PlannerEntity } from '../entity/planner.entity';
import { GetPlannerGateway } from '../gateways/get.planner.gateway';
import { GetPlannerInteractor } from '../usecases';
import { FindPlannerCriteria, IPlannerRepository } from './default.interfaces';

export type InputGetPlanner = {
  id_company: number;
  id_user: number;
  limite?: number;
  year?: number;
};

export type GetPlannerInteractorDependencies = {
  gateway: GetPlannerGateway;
  presenter: IPresenter;
};

export type IGetPlannerGatewayDependencies = {
  plannerRepository: IPlannerRepository;
  userRepository: IUserRepository;
  logging: typeof logger;
};

export type GetPlannerControllerDependencies = {
  interactor: GetPlannerInteractor;
};

export interface IGetPlannerGateway {
  findPlanner(
    criteria: FindPlannerCriteria
  ): Promise<PlannerEntity[] | undefined>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}
