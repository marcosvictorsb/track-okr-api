import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { PlanEntity } from '@domains/api/backoffice/entities/plan.entity';
import { IPlanRepository } from '@domains/api/backoffice/interfaces/default.interfaces';
import { CompanyEntity } from '@domains/api/companies/entity/company.entity';
import { ICompanyRepository } from '@domains/api/companies/interfaces';
import { FindPlannerCriteria } from '@domains/api/planners/interfaces';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  CreateUserCriteria,
  IUserRepository
} from '@domains/api/users/interfaces';
import { ISubscriptionRepository } from '@domains/common/subscriptions/interfaces';
import { CreateTrialSubscriptionInteractor } from '@domains/common/subscriptions/usecases/create.trial.subscription.interactor';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { Resend } from 'resend';

// Forward declaration
export interface RegisterBetaInteractor {
  execute(input: InputRegisterBeta): Promise<HttpResponse>;
}

export type InputRegisterBeta = {
  name: string;
  email: string;
  company_name: string;
  website: string;
  plan: string;
  is_beta_tester: boolean;
};

export type CreateBetaCompanyData = {
  name: string;
  cnpj: string;
  website?: string;
  created_at?: Date;
  updated_at?: Date;
};

export type CreateBetaUserData = {
  name: string;
  email: string;
  role: string;
  status: string;
  id_company: number;
  is_beta_tester?: boolean;
  created_at?: Date;
  updated_at?: Date;
};

export type CreateBetaSubscriptionData = {
  company_id: number;
  plan_id: number;
  status: string;
  trial_start_date: Date;
  trial_end_date: Date;
  started_at: Date;
  auto_renew: boolean;
  is_beta: boolean;
  created_at?: Date;
  updated_at?: Date;
};

export type RegisterBetaInteractorDependencies = {
  gateway: IRegisterBetaGateway;
  presenter: IPresenter;
  interactorCreateTrialSubscription: CreateTrialSubscriptionInteractor;
};

export type IRegisterBetaGatewayDependencies = {
  companyRepository: ICompanyRepository;
  userRepository: IUserRepository;
  planRepository: IPlanRepository;
  subscriptionRepository: ISubscriptionRepository;
  resendService: Resend;
  logging: typeof logger;
};

export type RegisterBetaControllerDependencies = {
  interactor: RegisterBetaInteractor;
};

export interface IRegisterBetaGateway {
  findUserByEmail(email: string): Promise<UserEntity | undefined>;
  findCompanyByName(name: string): Promise<CompanyEntity | undefined>;
  findPlanByName(
    criteria: FindPlannerCriteria
  ): Promise<PlanEntity | undefined>;
  createCompany(data: CreateBetaCompanyData): Promise<CompanyEntity>;
  createUser(data: CreateUserCriteria): Promise<UserEntity>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
  sendInviteEmail(email: string, activationLink: string): Promise<boolean>;
  generateActivationToken(userId: number): Promise<string>;
  signToken(user: Partial<UserEntity>): string;
}
