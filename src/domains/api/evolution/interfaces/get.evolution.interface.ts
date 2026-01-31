import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import {
  FindCheckinsCriteria,
  ICheckinsRepository
} from '@domains/api/checkins/interfaces';
import {
  FindObjectiveCriteria,
  IObjectiveRepository
} from '@domains/api/objectives/interfaces';
import { IProfileRepository } from '@domains/api/profile/interfaces';
import {
  FindResultKeyCriteria,
  IResultKeyRepository
} from '@domains/api/results-keys/interfaces';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { IUserRepository } from '@domains/api/users/interfaces/default.interfaces';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { Response } from 'express';

import { CheckinsEntity } from '@domains/api/checkins/entity/checkins.entity';
import {
  FilterOption,
  GranularityType,
  KeyResultEvolution,
  ObjectiveEvolution
} from '../entity/evolution.entity';

export interface InputGetEvolution {
  year: number;
  granularity: GranularityType;
  teams?: string[];
  responsibles?: string[];
  quarter?: number;
  id_company: number;
  id_user: number;
}

export interface IGetEvolutionController {
  getEvolution(request: UserPayload, response: Response): Promise<Response>;
}

export interface IGetEvolutionGateway {
  findObjectivesByYear(
    criteria: FindObjectiveCriteria
  ): Promise<ObjectiveEvolution[]>;

  findKeyResultsWithCheckIns(
    criteria: FindResultKeyCriteria
  ): Promise<KeyResultEvolution[]>;

  findCheckInsByResultKeys(
    criteria: FindCheckinsCriteria
  ): Promise<CheckinsEntity[]>;

  findAvailableTeams(id_company: number, year: number): Promise<FilterOption[]>;

  findAvailableResponsibles(
    id_company: number,
    year: number
  ): Promise<FilterOption[]>;

  findAvailableYears(id_company: number): Promise<number[]>;

  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IGetEvolutionGatewayDependencies {
  objectiveRepository: IObjectiveRepository;
  resultKeyRepository: IResultKeyRepository;
  checkInRepository: ICheckinsRepository;
  teamRepository: ITeamRepository;
  userRepository: IUserRepository;
  profileRepository: IProfileRepository;
  logging: typeof logger;
}

export interface GetEvolutionInteractorDependencies {
  gateway: IGetEvolutionGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
}

export interface GetEvolutionControllerDependencies {
  interactor: {
    execute(input: InputGetEvolution): Promise<HttpResponse>;
  };
}
