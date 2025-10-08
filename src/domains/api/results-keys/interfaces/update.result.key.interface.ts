import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { ResultKeyEntity } from '../entity/result-key.entity';
import { IResultKeyRepository } from './default.interface';

// Input types
export type InputUpdateResultKey = {
  id: number;
  id_user: number;
  id_company: number;
  name?: string;
  initial_value?: number;
  target_value?: number;
  current_value?: number;
  unit?: string;
  responsible_users?: number[];
  responsible_team_id?: number | null;
};

// Gateway dependencies
export type UpdateResultKeyGatewayDependencies = {
  resultKeyRepository: IResultKeyRepository;
  logging: typeof logger;
};

// Interactor dependencies
export type UpdateResultKeyInteractorDependencies = {
  gateway: IUpdateResultKeyGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

// Controller dependencies
export type UpdateResultKeyControllerDependencies = {
  interactor: UpdateResultKeyInteractor;
};

// Find criteria
export interface FindResultKeyCriteria {
  id?: number;
  id_result_key?: number;
}

// Update criteria
export interface UpdateResultKeyCriteria {
  id: number;
  name?: string;
  initial_value?: number;
  target_value?: number;
  current_value?: number;
  unit?: string;
  responsible_users?: number[];
  responsible_team_id?: number | null;
}

// Gateway interface
export interface IUpdateResultKeyGateway {
  findResultKey(
    criteria: FindResultKeyCriteria
  ): Promise<ResultKeyEntity | undefined>;
  updateResultKey(
    data: Partial<UpdateResultKeyCriteria>,
    criteria: FindResultKeyCriteria
  ): Promise<boolean>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

// Forward declarations for circular dependency
export declare class UpdateResultKeyInteractor {
  execute(input: InputUpdateResultKey): Promise<HttpResponse>;
}
