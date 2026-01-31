import { logger } from '@configs/logger';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import { IObjectiveRepository } from '@domains/api/objectives/interfaces';
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
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';

export type InputGetTeamPerformance = {
  id_company: number;
  id_user: number;
  quarter: number;
  year: number;
};

export type GetTeamPerformanceGatewayDependencies = {
  teamRepository: ITeamRepository;
  objectiveRepository: IObjectiveRepository;
  resultKeyRepository: IResultKeyRepository;
  logging: typeof logger;
};

export type GetTeamPerformanceInteractorDependencies = {
  gateway: IGetTeamPerformanceGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export type GetTeamPerformanceControllerDependencies = {
  interactor: GetTeamPerformanceInteractor;
};

export type GetTeamPerformanceFactoryDependencies =
  GetTeamPerformanceGatewayDependencies;

export interface FindTeamsWithObjectivesCriteria {
  id_company: number;
}

export interface FindTeamObjectivesCriteria {
  id_company: number;
  id_team: number;
  quarter?: number;
  year?: number;
}

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

export declare class GetTeamPerformanceInteractor {
  execute(input: InputGetTeamPerformance): Promise<HttpResponse>;
}
