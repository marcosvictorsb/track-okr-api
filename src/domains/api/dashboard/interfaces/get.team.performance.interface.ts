import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import {
  FindTeamCriteria,
  ITeamRepository
} from '@domains/api/teams/interfaces';
import { IObjectiveRepository } from '@domains/api/objectives/interfaces';
import {
  IResultKeyRepository,
  ResultKeyEntity
} from '@domains/api/results-keys';
import { logger } from '@configs/logger';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';

// Input types
export type InputGetTeamPerformance = {
  id_company: number;
  id_user: number;
};

// Gateway dependencies
export type GetTeamPerformanceGatewayDependencies = {
  teamRepository: ITeamRepository;
  objectiveRepository: IObjectiveRepository;
  resultKeyRepository: IResultKeyRepository;
  logging: typeof logger;
};

// Interactor dependencies
export type GetTeamPerformanceInteractorDependencies = {
  gateway: IGetTeamPerformanceGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

// Controller dependencies
export type GetTeamPerformanceControllerDependencies = {
  interactor: GetTeamPerformanceInteractor;
};

// Factory dependencies
export type GetTeamPerformanceFactoryDependencies =
  GetTeamPerformanceGatewayDependencies;

// Gateway criteria
export interface FindTeamsWithObjectivesCriteria {
  id_company: number;
}

export interface FindTeamObjectivesCriteria {
  id_company: number;
  id_team: number;
  quarter?: number;
  year?: number;
}

// Gateway interface
export interface IGetTeamPerformanceGateway {
  findTeamsWithObjectives(criteria: FindTeamCriteria): Promise<TeamEntity[]>;
  findTeamObjectives(
    criteria: FindTeamObjectivesCriteria
  ): Promise<ObjectiveEntity[]>;
  findTeamMembersCount(teamId: number): Promise<number>;
  findResultKeysByObjectiveIds(
    objectiveIds: number[]
  ): Promise<ResultKeyEntity[]>;
}

// Forward declarations for circular dependency
export declare class GetTeamPerformanceInteractor {
  execute(input: InputGetTeamPerformance): Promise<HttpResponse>;
}
