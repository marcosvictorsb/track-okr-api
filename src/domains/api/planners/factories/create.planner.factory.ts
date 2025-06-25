import { logger } from "@configs/logger";
import { CreatePlannerGateway } from "../gateways/create.planner";
import PlannerModel from "../model/planner.model";
import { PlannerRepository } from "../repository/planner.repository";
import { CreatePlannerInteractor } from "../usecases";
import { Presenter } from "@protocols/presenter";
import { CreatePlannerController } from "../controllers/";


const plannerRepository = new PlannerRepository({
  model: PlannerModel
});

const params = {
  logging: logger,
  plannerRepository,
}
const createPlannerGateway = new CreatePlannerGateway(params);
const interactor = new CreatePlannerInteractor({
  gateway: createPlannerGateway,
  presenter: new Presenter()
})

export const createPlannerController = new CreatePlannerController({ interactor });