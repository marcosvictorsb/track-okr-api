import { IPresenter } from '@protocols/presenter';
import { ObjectiveEntity } from '../entity/objective.entity';
import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { DataLogOutput } from '@adapters/services';
import {
  FindTeamCriteria,
  ITeamRepository
} from '@domains/api/teams/interfaces';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import { logger } from '@configs/logger';
import { IObjectiveRepository } from './default.interface';
import { IResultKeyRepository } from '@domains/api/results-keys/interfaces';
import { ResultKeyEntity } from '@domains/api/results-keys/entity/result-key.entity';

export interface GetObjectiveRequest {
  id?: number;
  id_team?: number;
  quarter?: number;
  year?: number;
}

export interface GetObjectiveResponse {
  objectives: ObjectiveEntity[];
}

export interface IGetObjectiveController {
  getObjectives(request: unknown, response: unknown): Promise<void>;
}

// Get Objective Interfaces
export interface InputGetObjective {
  id?: number;
  id_team?: number;
  quarter?: number;
  year?: number;
  id_company: number;
  id_user: number;
  limite?: number;
}

export interface IGetObjectiveGateway {
  findTeam(criteria: FindTeamCriteria): Promise<TeamEntity[]>;
  findById(id: number): Promise<ObjectiveEntity | null>;
  findByTeam(id_team: number): Promise<ObjectiveEntity[]>;
  findByQuarter(quarter: number, year: number): Promise<ObjectiveEntity[]>;
  findResultKeysByObjectiveIds(
    objectiveIds: number[]
  ): Promise<ResultKeyEntity[]>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IGetObjectiveGatewayDependencies {
  objectiveRepository: IObjectiveRepository;
  teamRepository: ITeamRepository;
  resultKeyRepository: IResultKeyRepository;
  logging: typeof logger;
}

export interface GetObjectiveInteractorDependencies {
  gateway: IGetObjectiveGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
}

export interface GetObjectiveControllerDependencies {
  interactor: {
    execute(input: InputGetObjective): Promise<HttpResponse>;
  };
}
