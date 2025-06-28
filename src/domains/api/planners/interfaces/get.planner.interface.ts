import { IPresenter } from "@protocols/presenter";
import { FindPlannerCriteria, GetPlannerCriteria, IPlannerRepository } from "./default.interfaces";
import { DataLogOutput } from "@adapters/services";
import { PlannerEntity } from "../entity/planner.entity";
import { GetPlannerGateway } from "../gateways/Get.planner";
import { GetPlannerInteractor } from "../usecases";
import { IUserRepository } from "@domains/api/users/interfaces";
import { logger } from "@configs/logger";

export type InputGetPlanner = {
  id_company: number;
  id_user: number;
  limite?: number;
}

export type GetPlannerInteractorDependencies = {
  gateway: GetPlannerGateway; 
  presenter: IPresenter;
}

export type IGetPlannerGatewayDependencies = {
  plannerRepository: IPlannerRepository;
  userRepository: IUserRepository;
  logging: typeof logger
}

export type GetPlannerControllerDependencies = {
  interactor: GetPlannerInteractor;
}

export interface IGetPlannerGateway {
  findPlanner(criteria: FindPlannerCriteria): Promise<PlannerEntity | undefined>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}