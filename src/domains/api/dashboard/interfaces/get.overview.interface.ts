import { Response } from 'express';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { UserCompanyValidationInteractor } from '@domains/common';
import { IOverviewEntity } from '../entity/overview.entity';
import {
  FindTeamCriteria,
  ITeamRepository
} from '@domains/api/teams/interfaces';
import {
  FindObjectiveCriteria,
  IObjectiveRepository
} from '@domains/api/objectives/interfaces';
import {
  IResultKeyRepository,
  ResultKeyEntity
} from '@domains/api/results-keys';
import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';

export interface InputGetOverview {
  quarter?: number;
  year?: number;
  team?: string;
  status?: string;
  id_company: number;
  id_user: number;
}

// export interface Find
// TeamCriteria {
//   name?: string;
//   id_company: number;
// }

// export interface Find
// ObjectiveCriteria {
//   id_company: number;
//   quarter: number;
//   year: number;
//   id_team?: number;
//   status?: string;
// }

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
  getOverview(request: UserPayload, response: Response): Promise<void>;
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
