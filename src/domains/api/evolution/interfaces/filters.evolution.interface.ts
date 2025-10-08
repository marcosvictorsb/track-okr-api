import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { IObjectiveRepository } from '@domains/api/objectives/interfaces';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { IUserRepository } from '@domains/api/users/interfaces';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { IPresenter } from '@protocols/presenter';
import { Response } from 'express';
import { FiltersEvolutionInteractor } from '../usecases/filters.evolution.interactor';

export interface InputFiltersEvolution {
  id_company: number;
  id_user: number;
}

export interface IFiltersEvolutionController {
  getFilters(request: UserPayload, response: Response): Promise<Response>;
}

export interface IFiltersEvolutionGateway {
  getYearByObjectives(id_company: number): Promise<number[]>;
  getTeamsByCompany(
    id_company: number
  ): Promise<{ label: string; value: string }[]>;
  findResponsiblesByCompany(
    id_company: number
  ): Promise<{ label: string; value: string }[]>;
  loggerInfo(message: string, meta?: DataLogOutput): void;
  loggerError(message: string, meta?: DataLogOutput): void;
}

export type IFiltersEvolutionGatewayDependencies = {
  objectiveRepository: IObjectiveRepository;
  teamRepository: ITeamRepository;
  userRepository: IUserRepository;
  logging: typeof logger;
};

export type FiltersEvolutionInteractorDependencies = {
  gateway: IFiltersEvolutionGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export interface FiltersControllerDependencies {
  interactor: FiltersEvolutionInteractor;
}
