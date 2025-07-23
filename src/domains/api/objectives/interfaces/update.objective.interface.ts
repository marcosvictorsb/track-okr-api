import { DataLogOutput } from '@adapters/services';
import { ObjectiveEntity } from '../entity/objective.entity';
import {
  FindObjectiveCriteria,
  UpdateObjectiveCriteria
} from './default.interface';
import { IPresenter } from '@protocols/presenter';
import { HttpResponse } from '@protocols/http';
import { UserCompanyValidationInteractor } from '@domains/common';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import { FindTeamCriteria } from '@domains/api/teams/interfaces';

export interface UpdateObjectiveRequest {
  id: number;
  title?: string;
  description?: string;
  status?: 'active' | 'cancelled' | 'completed';
  quarter?: number;
  year?: number;
}

export interface UpdateObjectiveResponse {
  objective: ObjectiveEntity;
}

export type InputUpdateObjective = {
  id: number;
  title?: string;
  description?: string;
  status?: 'active' | 'cancelled' | 'completed';
  quarter?: number;
  year?: number;
  id_company: number;
  id_user: number;
  id_team?: number;
  id_planner?: number;
};

export type UpdateObjectiveInteractorDependencies = {
  gateway: IUpdateObjectiveGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export type UpdateObjectiveControllerDependencies = {
  interactor: {
    execute(input: InputUpdateObjective): Promise<HttpResponse>;
  };
};

export interface IUpdateObjectiveController {
  updateObjective(request: unknown, response: unknown): Promise<unknown>;
}

export interface IUpdateObjectiveGateway {
  findObjective(
    criteria: FindObjectiveCriteria
  ): Promise<ObjectiveEntity | null>;
  update(
    id: number,
    data: UpdateObjectiveCriteria
  ): Promise<ObjectiveEntity | null>;
  findTeam(criteria: FindTeamCriteria): Promise<TeamEntity | undefined>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}
