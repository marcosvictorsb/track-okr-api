import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { IObjectiveRepository } from '@domains/api/objectives/interfaces';
import { IResultKeyRepository } from '@domains/api/results-keys';
import { IResultKeyUpdateRepository } from '@domains/api/results-keys/interfaces/result-key-update.interface';
import { logger } from '@configs/logger';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import { ResultKeyEntity } from '@domains/api/results-keys/entity/result-key.entity';
import { ResultKeyUpdateEntity } from '@domains/api/results-keys/entity/result-key-update.entity';
import { DataLogOutput } from '@adapters/services';

// Input types
export type InputGetTemporalEvolution = {
  id_company: number;
  id_user: number;
  quarter?: number;
  year?: number;
  period?: 'monthly' | 'weekly';
};

// Gateway dependencies
export type GetTemporalEvolutionGatewayDependencies = {
  teamRepository: ITeamRepository;
  objectiveRepository: IObjectiveRepository;
  resultKeyRepository: IResultKeyRepository;
  resultKeyUpdateRepository: IResultKeyUpdateRepository;
  logging: typeof logger;
};

// Interactor dependencies
export type GetTemporalEvolutionInteractorDependencies = {
  gateway: IGetTemporalEvolutionGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

// Controller dependencies
export type GetTemporalEvolutionControllerDependencies = {
  interactor: GetTemporalEvolutionInteractor;
};

// Gateway criteria
export interface FindObjectivesByCompanyAndQuarterCriteria {
  id_company: number;
  quarter: number;
  year: number;
}

export interface FindResultKeyUpdatesByCriteria {
  resultKeyIds: number[];
  startDate?: Date;
  endDate?: Date;
}

// Gateway interface
export interface IGetTemporalEvolutionGateway {
  findObjectivesByCompanyAndQuarter(
    criteria: FindObjectivesByCompanyAndQuarterCriteria
  ): Promise<ObjectiveEntity[]>;
  findResultKeysByObjectiveIds(
    objectiveIds: number[]
  ): Promise<ResultKeyEntity[]>;
  findResultKeyUpdatesByIds(
    criteria: FindResultKeyUpdatesByCriteria
  ): Promise<ResultKeyUpdateEntity[]>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

// Forward declarations for circular dependency
export declare class GetTemporalEvolutionInteractor {
  execute(input: InputGetTemporalEvolution): Promise<HttpResponse>;
}
