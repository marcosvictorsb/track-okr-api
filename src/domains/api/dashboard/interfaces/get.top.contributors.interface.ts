import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { ICheckinsRepository } from '@domains/api/checkins/interfaces/default.interface';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import { IObjectiveRepository } from '@domains/api/objectives/interfaces';
import { IProfileRepository } from '@domains/api/profile/interfaces/default.interfaces';
import { IResultKeyRepository } from '@domains/api/results-keys';
import { ResultKeyEntity } from '@domains/api/results-keys/entity/result-key.entity';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { IUserRepository } from '@domains/api/users/interfaces';
import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';

export type InputGetTopContributors = {
  id_company: number;
  id_user: number;
  quarter?: number;
  year?: number;
  limit?: number;
  page?: number;
};

export type GetTopContributorsGatewayDependencies = {
  teamRepository: ITeamRepository;
  objectiveRepository: IObjectiveRepository;
  resultKeyRepository: IResultKeyRepository;
  checkinsRepository: ICheckinsRepository;
  userRepository: IUserRepository;
  profileRepository: IProfileRepository;
  logging: typeof logger;
};

export type GetTopContributorsInteractorDependencies = {
  gateway: IGetTopContributorsGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export type GetTopContributorsControllerDependencies = {
  interactor: GetTopContributorsInteractor;
};

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

export interface IGetTopContributorsGateway {
  findObjectivesByCompany(
    criteria: FindObjectivesByCompanyCriteria
  ): Promise<ObjectiveEntity[]>;
  findResultKeysByObjectiveIds(
    objectiveIds: number[]
  ): Promise<ResultKeyEntity[]>;
  findCheckinsByResultKeyIds(resultKeyIds: number[]): Promise<
    Array<{
      id: number;
      id_result_key: number;
      previous_value: number;
      new_value: number;
      comment: string;
      id_user: number;
      created_at: string;
    }>
  >;
  findUserById(userId: number): Promise<UserEntity | undefined>;
  findTeamById(teamId: number): Promise<TeamEntity | undefined>;
  findUserProfileAvatar(userId: number): Promise<string | undefined>;
  countCheckInsByResultKeyIds(
    resultKeyIds: number[],
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ id_user: number; check_ins: number }>>;
  findUsersProfileByIds(ids_users: number[]): Promise<
    Array<{
      id: number;
      name: string;
      email: string;
      avatar_url: string | null;
    }>
  >;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export declare class GetTopContributorsInteractor {
  execute(input: InputGetTopContributors): Promise<HttpResponse>;
}
