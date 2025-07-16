import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { IObjectiveRepository } from '@domains/api/objectives/interfaces';
import { IResultKeyRepository } from '@domains/api/results-keys';
import { IUserRepository } from '@domains/api/users/interfaces';
import { IResultKeyUpdateRepository } from '@domains/api/results-keys/interfaces/result-key-update.interface';
import { IProfileRepository } from '@domains/api/profile/interfaces/default.interfaces';
import { logger } from '@configs/logger';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import { ResultKeyEntity } from '@domains/api/results-keys/entity/result-key.entity';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { DataLogOutput } from '@adapters/services';

// Input types
export type InputGetTopContributors = {
  id_company: number;
  id_user: number;
  quarter?: number;
  year?: number;
  limit?: number;
  page?: number;
};

// Gateway dependencies
export type GetTopContributorsGatewayDependencies = {
  teamRepository: ITeamRepository;
  objectiveRepository: IObjectiveRepository;
  resultKeyRepository: IResultKeyRepository;
  resultKeyUpdateRepository: IResultKeyUpdateRepository;
  userRepository: IUserRepository;
  profileRepository: IProfileRepository;
  logging: typeof logger;
};

// Interactor dependencies
export type GetTopContributorsInteractorDependencies = {
  gateway: IGetTopContributorsGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

// Controller dependencies
export type GetTopContributorsControllerDependencies = {
  interactor: GetTopContributorsInteractor;
};

// Gateway criteria
export interface FindObjectivesByCompanyCriteria {
  id_company: number;
  quarter?: number;
  year?: number;
}

export interface FindResultKeysByObjectiveIdsCriteria {
  objectiveIds: number[];
}

export interface FindUserProfileCriteria {
  userId: number;
}

export interface FindTeamByIdCriteria {
  teamId: number;
}

// Gateway interface
export interface IGetTopContributorsGateway {
  findObjectivesByCompany(
    criteria: FindObjectivesByCompanyCriteria
  ): Promise<ObjectiveEntity[]>;
  findResultKeysByObjectiveIds(
    objectiveIds: number[]
  ): Promise<ResultKeyEntity[]>;
  findUserById(userId: number): Promise<UserEntity | undefined>;
  findTeamById(teamId: number): Promise<TeamEntity | undefined>;
  findUserProfileAvatar(userId: number): Promise<string | undefined>;
  countCheckInsByResultKeyIds(
    resultKeyIds: number[],
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ id_user: number; check_ins: number }>>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

// Forward declarations for circular dependency
export declare class GetTopContributorsInteractor {
  execute(input: InputGetTopContributors): Promise<HttpResponse>;
}
