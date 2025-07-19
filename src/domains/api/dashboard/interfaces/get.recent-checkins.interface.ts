import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import { ResultKeyUpdateEntity } from '@domains/api/checkins/entity/result-key-update.entity';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import { ResultKeyEntity } from '@domains/api/results-keys/entity/result-key.entity';

export interface InputGetRecentCheckIns {
  id_user: number;
  id_company: number;
  quarter?: number;
  year?: number;
}

export interface FindObjectivesByCompanyAndQuarterCriteria {
  id_company: number;
  quarter: number;
  year: number;
}

export interface FindResultKeyUpdatesCriteria {
  resultKeyIds: number[];
  limit?: number;
}

export interface IGetRecentCheckInsGateway {
  loggerInfo(message: string, data?: Record<string, unknown>): void;
  loggerError(message: string, data?: Record<string, unknown>): void;
  findObjectivesByCompanyAndQuarter(
    criteria: FindObjectivesByCompanyAndQuarterCriteria
  ): Promise<ObjectiveEntity[]>;
  findResultKeysByObjectiveIds(
    objectiveIds: number[]
  ): Promise<ResultKeyEntity[]>;
  findRecentResultKeyUpdates(
    criteria: FindResultKeyUpdatesCriteria
  ): Promise<ResultKeyUpdateEntity[]>;
  findUserById(
    id: number
  ): Promise<{ id: number; name: string; avatar?: string } | null>;
  findUserTeam(userId: number): Promise<{ name: string } | null>;
}

export interface GetRecentCheckInsInteractorDependencies {
  gateway: IGetRecentCheckInsGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
}
