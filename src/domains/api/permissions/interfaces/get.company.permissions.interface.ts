import { IPresenter } from '@protocols/presenter';
import { DataLogOutput } from '@adapters/services';
import { GetCompanyPermissionsGateway } from '../gateways/get.company.permissions.gateway';
import { GetCompanyPermissionsInteractor } from '../usecases/get.company.permissions.interactor';
import { UserCompanyValidationInteractor } from '@domains/common';
import { ICheckCompanyFeatureLimitsInteractor } from '@domains/common/validations/interfaces/check.company.feature.limits.interface';
import { logger } from '@configs/logger';

export type InputGetCompanyPermissions = {
  id_company: number;
  id_user: number;
};

export interface FeaturePermission {
  canCreate: boolean;
  current: number;
  limit: number;
  remaining: number;
}

export interface CompanyInfo {
  id: number;
  name: string;
  subscription: {
    plan_name: string;
    status: string;
    trial_end_date: Date | null;
  };
}

export interface CompanyPermissionsResponse {
  // company: CompanyInfo;
  permissions: {
    users: FeaturePermission;
    // planners: FeaturePermission;
    // teams: FeaturePermission;
    // objectives: FeaturePermission;
    // key_results: FeaturePermission;
  };
}

export type GetCompanyPermissionsInteractorDependencies = {
  gateway: GetCompanyPermissionsGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
  checkCompanyFeatureLimits: ICheckCompanyFeatureLimitsInteractor;
};

export type GetCompanyPermissionsGatewayDependencies = {
  logging: typeof logger;
};

export type GetCompanyPermissionsControllerDependencies = {
  interactor: GetCompanyPermissionsInteractor;
};

export interface IGetCompanyPermissionsGateway {
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}
