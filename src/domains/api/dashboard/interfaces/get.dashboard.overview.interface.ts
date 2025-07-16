import { Response } from 'express';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { UserCompanyValidationInteractor } from '@domains/common';
import { IDashboardOverviewEntity } from '../entity/dashboard.overview.entity';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { IObjectiveRepository } from '@domains/api/objectives/interfaces';
import {
  IResultKeyRepository,
  ResultKeyEntity
} from '@domains/api/results-keys';
import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';

export interface InputGetDashboardOverview {
  quarter?: number;
  year?: number;
  team?: string;
  status?: string;
  id_company: number;
  id_user: number;
}

export interface FindDashboardTeamCriteria {
  name?: string;
  id_company: number;
}

export interface FindDashboardObjectiveCriteria {
  id_company: number;
  quarter: number;
  year: number;
  id_team?: number;
  status?: string;
}

export type GetDashboardOverviewGatewayDependencies = {
  teamRepository: ITeamRepository;
  objectiveRepository: IObjectiveRepository;
  resultKeyRepository: IResultKeyRepository;
  logging: typeof logger;
};

export interface IGetDashboardOverviewGateway {
  findTeam(
    criteria: FindDashboardTeamCriteria
  ): Promise<TeamEntity | undefined>;
  findObjectives(
    criteria: FindDashboardObjectiveCriteria
  ): Promise<ObjectiveEntity[]>;
  findPreviousObjectives(
    criteria: FindDashboardObjectiveCriteria
  ): Promise<ObjectiveEntity[]>;
  findResultKeysByObjectiveIds(
    objectiveIds: number[]
  ): Promise<ResultKeyEntity[]>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IGetDashboardOverviewController {
  getOverview(request: UserPayload, response: Response): Promise<void>;
}

export interface GetDashboardOverviewInteractorDependencies {
  gateway: IGetDashboardOverviewGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
}

export interface GetDashboardOverviewControllerDependencies {
  interactor: {
    execute(input: InputGetDashboardOverview): Promise<HttpResponse>;
  };
}
