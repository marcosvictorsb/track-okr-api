import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { UserTeamEntity } from '@domains/common/user-teams/entity/user-team.entity';
import {
  FindUserTeamCriteria,
  IUserTeamRepository
} from '@domains/common/user-teams/interfaces';
import { UserCompanyValidationInteractor } from '@domains/common/validations/usecases';
import { IPresenter } from '@protocols/presenter';
import { GetInformationInteractor } from '../usecases';

export type InputGetInformation = {
  id_company: number;
  id_user: number;
};

export type GetInformationInteractorDependencies = {
  gateway: IGetInformationGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export type IGetPlannerGatewayDependencies = {
  logging: typeof logger;
  userTeamRepository: IUserTeamRepository;
};

export type GetInformationControllerDependencies = {
  interactor: GetInformationInteractor;
};

export interface IGetInformationGateway {
  findUserTeam(
    criteria: FindUserTeamCriteria
  ): Promise<UserTeamEntity | undefined>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}
