import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { ObjectiveEntity } from '../entity/objective.entity';
import { CreateObjectiveCriteria, IObjectiveRepository } from '.';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { logger } from '@configs/logger';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { DataLogOutput } from '@adapters/services';

export interface ICreateObjectiveController {
  createObjective(request: UserPayload, response: Response): Promise<Response>;
}

export type ICreateObjectiveGatewayDependencies = {
  objectiveRepository: IObjectiveRepository;
  teamRepository: ITeamRepository;
  logging: typeof logger;
};

export interface InputCreateObjective {
  title: string;
  description?: string;
  id_team: number;
  quarter: number;
  year: number;
  id_company: number;
  id_user: number;
  id_planner?: number;
}

export interface ICreateObjectiveGateway {
  create(data: CreateObjectiveCriteria): Promise<ObjectiveEntity>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface CreateObjectiveInteractorDependencies {
  gateway: ICreateObjectiveGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
}

export interface CreateObjectiveControllerDependencies {
  interactor: {
    execute(input: InputCreateObjective): Promise<HttpResponse>;
  };
}

export interface CreateObjectiveRequest {
  title: string;
  description?: string;
  id_team: number;
  quarter: number;
  year: number;
}

export interface CreateObjectiveResponse {
  objective: ObjectiveEntity;
}
