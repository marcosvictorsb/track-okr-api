import { IPresenter } from "@protocols/presenter";
import { CreatePlannerCriteria, IPlannerRepository } from "./default.interfaces";
import { DataLogOutput } from "@adapters/services";
import { PlannerEntity } from "../entity/planner.entity";
import { CreatePlannerGateway } from "../gateways/create.planner";
import { CreatePlannerInteractor } from "../usecases";

export type InputCreatePlanner = {
  title: string;
  description: string;
  year: number;
  id_company: number;
}

export type CreatePlannerInteractorDependencies = {
  gateway: CreatePlannerGateway; 
  presenter: IPresenter;
}

export type ICreatePlannerGatewayDependencies = {
  plannerRepository: IPlannerRepository
}

export type CreatePlannerControllerDependencies = {
  interactor: CreatePlannerInteractor;
}

export interface ICreatePlannerGateway {
  findPlanner(criteria: CreatePlannerCriteria): Promise<PlannerEntity | undefined>;
  createPlanner(data: CreatePlannerCriteria): Promise<PlannerEntity>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}