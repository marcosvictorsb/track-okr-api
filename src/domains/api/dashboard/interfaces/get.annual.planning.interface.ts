import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { IObjectiveRepository } from '@domains/api/objectives/interfaces';
import { IPlannerRepository } from '@domains/api/planners/interfaces';
import { IResultKeyRepository } from '@domains/api/results-keys/interfaces';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { Response } from 'express';

export interface InputGetAnnualPlanning {
  id_company: number;
  id_user: number;
  year: number;
  quarter: number;
}

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

export interface IGetAnnualPlanningGateway {
  getAnnualPlannings(
    year: number,
    quarter: number,
    companyId: number
  ): Promise<AnnualPlanningItem[]>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

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
