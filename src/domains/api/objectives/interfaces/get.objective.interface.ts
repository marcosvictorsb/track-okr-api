import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { ProfileEntity } from '@domains/api/profile/entity';
import {
  FindProfileCriteria,
  IProfileRepository
} from '@domains/api/profile/interfaces';
import { ResultKeyEntity } from '@domains/api/results-keys/entity/result-key.entity';
import { IResultKeyRepository } from '@domains/api/results-keys/interfaces';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import {
  FindTeamCriteria,
  ITeamRepository
} from '@domains/api/teams/interfaces';
import {
  FindUserCriteria,
  IUserRepository
} from '@domains/api/users/interfaces/default.interfaces';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { Response } from 'express';
import { ObjectiveEntity } from '../entity/objective.entity';
import { IObjectiveRepository } from './default.interface';

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
  getObjectives(request: UserPayload, response: Response): Promise<Response>;
}

export interface InputGetObjective {
  id?: number;
  id_team?: number;
  quarter?: number;
  year?: number;
  status?: string;
  id_company: number;
  id_user: number;
  limite?: number;
}

export interface IGetObjectiveGateway {
  findTeam(criteria: FindTeamCriteria): Promise<TeamEntity[]>;
  findById(id: number): Promise<ObjectiveEntity | null>;
  findByTeam(id_team: number): Promise<ObjectiveEntity[]>;
  findByQuarter(
    quarter: number,
    year: number,
    id_company: number,
    status?: string
  ): Promise<ObjectiveEntity[]>;
  findResultKeysByObjectiveIds(
    objectiveIds: number[]
  ): Promise<ResultKeyEntity[]>;
  findUsers(
    criteria: FindUserCriteria
  ): Promise<Array<{ id: number; name: string }>>;
  findProfilesByUserIds(
    criteria: FindProfileCriteria
  ): Promise<ProfileEntity[]>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IGetObjectiveGatewayDependencies {
  objectiveRepository: IObjectiveRepository;
  teamRepository: ITeamRepository;
  resultKeyRepository: IResultKeyRepository;
  profileRepository: IProfileRepository;
  userRepository: IUserRepository;
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
