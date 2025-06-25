import { PlannerEntity } from "../entity/planner.entity";
import { CreatePlannerCriteria, FindPlannerCriteria, IPlannerRepository } from "../interfaces";
import { ICreatePlannerGateway, ICreatePlannerGatewayDependencies } from "../interfaces/create.planner.interface";
import { MixCreatePlanner } from "@adapters/gateways/planners/";

export class CreatePlannerGateway extends MixCreatePlanner implements ICreatePlannerGateway {
  plannerRepository: IPlannerRepository;

  constructor(params: ICreatePlannerGatewayDependencies) {
    super(params);
    this.plannerRepository = params.plannerRepository;
  }

  async findPlanner(criteria: FindPlannerCriteria): Promise<PlannerEntity | undefined> {
    return await this.plannerRepository.find(criteria);
  }

  async createPlanner(data: CreatePlannerCriteria): Promise<PlannerEntity> {
    return await this.plannerRepository.create(data);
  }
  
}