import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { CompanyEntity } from '@domains/api/companies/entity/company.entity';
import {
  FindCompanyCriteria,
  ICompanyRepository
} from '@domains/api/companies/interfaces';
import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import bcrypt from 'bcryptjs';
import { UserEntity } from '../entity/user.entity';
import {
  FindUserCriteria,
  IUserRepository,
  UpdateUserCriteria
} from './default.interfaces';

export type InputActivateUserPurchase = {
  id_company: number;
  id_user: number;
  email: string;
  password: string;
  company_name: string;
  company_document: string;
};

export type ActivateUserPurchaseInteractorDependencies = {
  gateway: IActivateUserPurchaseGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export type ActivateUserPurchaseControllerDependencies = {
  interactor: {
    execute(input: InputActivateUserPurchase): Promise<HttpResponse>;
  };
};

export interface IActivateUserPurchaseGateway {
  findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined>;
  updateUser(
    data: Partial<UpdateUserCriteria>,
    criteria: UpdateUserCriteria
  ): Promise<boolean>;
  findCompany(
    criteria: FindCompanyCriteria
  ): Promise<CompanyEntity | undefined>;
  updateCompany(
    data: Partial<CompanyEntity>,
    criteria: FindCompanyCriteria
  ): Promise<boolean>;
  encryptPassword(password: string): string;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IActivateUserPurchaseGatewayDependencies {
  userRepository: IUserRepository;
  companyRepository: ICompanyRepository;
  logging: typeof logger;
  bcrypt: typeof bcrypt;
}
