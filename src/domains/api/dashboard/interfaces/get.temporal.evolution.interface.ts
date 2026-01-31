import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { CheckinsEntity } from '@domains/api/checkins/entity/checkins.entity';
import { ICheckinsRepository } from '@domains/api/checkins/interfaces/default.interface';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import { IObjectiveRepository } from '@domains/api/objectives/interfaces';
import { IResultKeyRepository } from '@domains/api/results-keys';
import { ResultKeyEntity } from '@domains/api/results-keys/entity/result-key.entity';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';

export type InputGetTemporalEvolution = {
  id_company: number;
  id_user: number;
  quarter: number;
  year: number;
  period?: 'monthly' | 'weekly';
};

export type GetTemporalEvolutionGatewayDependencies = {
  teamRepository: ITeamRepository;
  objectiveRepository: IObjectiveRepository;
  resultKeyRepository: IResultKeyRepository;
  checkinsRepository: ICheckinsRepository;
  logging: typeof logger;
};

export type GetTemporalEvolutionInteractorDependencies = {
  gateway: IGetTemporalEvolutionGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export type GetTemporalEvolutionControllerDependencies = {
  interactor: GetTemporalEvolutionInteractor;
};

export interface FindObjectivesByCompanyAndQuarterCriteria {
  id_company: number;
  quarter: number;
  year: number;
}

export interface FindCheckinsByCriteria {
  resultKeyIds: number[];
  startDate?: Date;
  endDate?: Date;
}

export interface IGetTemporalEvolutionGateway {
  findObjectivesByCompanyAndQuarter(
    criteria: FindObjectivesByCompanyAndQuarterCriteria
  ): Promise<ObjectiveEntity[]>;
  findResultKeysByObjectiveIds(
    objectiveIds: number[]
  ): Promise<ResultKeyEntity[]>;
  findCheckinsByIds(
    criteria: FindCheckinsByCriteria
  ): Promise<CheckinsEntity[]>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export declare class GetTemporalEvolutionInteractor {
  execute(input: InputGetTemporalEvolution): Promise<HttpResponse>;
}
