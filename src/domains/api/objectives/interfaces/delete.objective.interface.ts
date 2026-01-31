import { logger } from '@configs/logger';
import { CheckinsEntity } from '@domains/api/checkins/entity/checkins.entity';
import {
  DeleteCheckinsCriteria,
  FindCheckinsCriteria,
  ICheckinsRepository
} from '@domains/api/checkins/interfaces';
import {
  DeleteResultKeyCriteria,
  FindResultKeyCriteria,
  IResultKeyRepository,
  ResultKeyEntity
} from '@domains/api/results-keys';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { IPresenter } from '@protocols/presenter';
import { Response } from 'express';
import { ObjectiveEntity } from '../entity/objective.entity';
import {
  FindObjectiveCriteria,
  IObjectiveRepository
} from './default.interface';

export interface DeleteObjectiveRequest {
  id: number;
  id_company: number;
  id_user: number;
}

export interface DeleteObjectiveResponse {
  success: boolean;
}

export interface IDeleteObjectiveGatewayDependencies {
  objectiveRepository: IObjectiveRepository;
  resultKeyRepository: IResultKeyRepository;
  checkinsRepository: ICheckinsRepository;
  logging: typeof logger;
}

export interface DeleteObjectiveInteractorDependencies {
  gateway: IDeleteObjectiveGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
}

export interface IDeleteObjectiveController {
  deleteObjective(request: UserPayload, response: Response): Promise<Response>;
}

export interface IDeleteObjectiveGateway {
  findObjective(
    criteria: FindObjectiveCriteria
  ): Promise<ObjectiveEntity | null>;
  findResultKeysByObjective(
    criteria: FindResultKeyCriteria
  ): Promise<ResultKeyEntity[]>;
  findCheckins(criteria: FindCheckinsCriteria): Promise<CheckinsEntity[]>;
  delete(id: number): Promise<boolean>;
  deleteResultKeys(criteria: DeleteResultKeyCriteria): Promise<boolean>;
  deleteChekins(criteria: DeleteCheckinsCriteria): Promise<boolean>;
  loggerInfo(message: string, data?: Record<string, unknown>): void;
  loggerError(message: string, data?: Record<string, unknown>): void;
}
