import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import {
  FindObjectiveCriteria,
  IObjectiveRepository
} from '@domains/api/objectives/interfaces';
import {
  IResultKeyRepository,
  ResultKeyEntity
} from '@domains/api/results-keys';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import {
  FindTeamCriteria,
  ITeamRepository
} from '@domains/api/teams/interfaces';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { Response } from 'express';

export interface InputGetOverview {
  quarter?: number;
  year?: number;
  team?: string;
  status?: string;
  id_company: number;
  id_user: number;
}

export type GetOverviewGatewayDependencies = {
  teamRepository: ITeamRepository;
  objectiveRepository: IObjectiveRepository;
  resultKeyRepository: IResultKeyRepository;
  logging: typeof logger;
};

export interface IGetOverviewGateway {
  findTeam(criteria: FindTeamCriteria): Promise<TeamEntity | undefined>;
  findObjectives(criteria: FindObjectiveCriteria): Promise<ObjectiveEntity[]>;
  findPreviousObjectives(
    criteria: FindObjectiveCriteria
  ): Promise<ObjectiveEntity[]>;
  findResultKeysByObjectiveIds(
    objectiveIds: number[]
  ): Promise<ResultKeyEntity[]>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IGetOverviewController {
  getOverview(request: UserPayload, response: Response): Promise<Response>;
}

export interface GetOverviewInteractorDependencies {
  gateway: IGetOverviewGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
}

export interface GetOverviewControllerDependencies {
  interactor: {
    execute(input: InputGetOverview): Promise<HttpResponse>;
  };
}
