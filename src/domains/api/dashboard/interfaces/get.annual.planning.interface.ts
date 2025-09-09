import { Response } from 'express';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { UserCompanyValidationInteractor } from '@domains/common';
import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { IPlannerRepository } from '@domains/api/planners/interfaces';
import { IObjectiveRepository } from '@domains/api/objectives/interfaces';
import { IResultKeyRepository } from '@domains/api/results-keys/interfaces';

// Input types
export interface InputGetAnnualPlanning {
  id_company: number;
  id_user: number;
  year: number;
  quarter: number;
}

// Response types
export interface AnnualPlanningItem {
  id: number;
  title: string;
  description?: string;
  totalObjectives: number;
  completedObjectives: number;
  overallProgressPercentage: number;
}

export interface OutputGetAnnualPlanning {
  plannings: AnnualPlanningItem[];
  totalPlannings: number;
  year: number;
  quarter: number;
}

// Gateway interface
export interface IGetAnnualPlanningGateway {
  getAnnualPlannings(
    year: number,
    quarter: number,
    companyId: number
  ): Promise<AnnualPlanningItem[]>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

// Dependencies
export interface GetAnnualPlanningGatewayDependencies {
  plannerRepository: IPlannerRepository;
  objectiveRepository: IObjectiveRepository;
  resultKeyRepository: IResultKeyRepository;
  logging: typeof logger;
}

export interface GetAnnualPlanningInteractorDependencies {
  gateway: IGetAnnualPlanningGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
}

export interface GetAnnualPlanningControllerDependencies {
  interactor: {
    execute(input: InputGetAnnualPlanning): Promise<HttpResponse>;
  };
}

export interface IGetAnnualPlanningController {
  getAnnualPlanning(
    request: UserPayload,
    response: Response
  ): Promise<Response>;
}
