import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { PlanEntity } from '@domains/api/backoffice/entities/plan.entity';
import { IPlanRepository } from '@domains/api/backoffice/interfaces/default.interfaces';
import { CompanyEntity } from '@domains/api/companies/entity/company.entity';
import { ICompanyRepository } from '@domains/api/companies/interfaces';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  CreateUserCriteria,
  IUserRepository
} from '@domains/api/users/interfaces';
import { ISubscriptionRepository } from '@domains/common/subscriptions/interfaces';
import { CreateTrialSubscriptionInteractor } from '@domains/common/subscriptions/usecases/create.trial.subscription.interactor';
import { IPresenter } from '@protocols/presenter';
import { Resend } from 'resend';
import { RegisterFreeTrialInteractor } from '../usecases';

export type InputRegisterFreeTrial = {
  name: string;
  email: string;
  password: string;
  company_name: string;
  plan: string;
};

export type CreateCompanyData = {
  name: string;
  cnpj?: string;
  created_at?: Date;
  updated_at?: Date;
};

export type CreateUserData = {
  name: string;
  email: string;
  password: string;
  role: string;
  status: string;
  id_company: number;
  created_at?: Date;
  updated_at?: Date;
};

export type CreateSubscriptionData = {
  company_id: number;
  plan_id: number;
  status: string;
  trial_start_date: Date;
  trial_end_date: Date;
  started_at: Date;
  auto_renew: boolean;
  created_at?: Date;
  updated_at?: Date;
};

export type RegisterFreeTrialInteractorDependencies = {
  gateway: IRegisterFreeTrialGateway;
  presenter: IPresenter;
  interactorCreateTrialSubscription: CreateTrialSubscriptionInteractor;
};

export type IRegisterFreeTrialGatewayDependencies = {
  companyRepository: ICompanyRepository;
  userRepository: IUserRepository;
  planRepository: IPlanRepository;
  subscriptionRepository: ISubscriptionRepository;
  resendService: Resend;
  logging: typeof logger;
};

export type RegisterFreeTrialControllerDependencies = {
  interactor: RegisterFreeTrialInteractor;
};

export interface IRegisterFreeTrialGateway {
  findUserByEmail(email: string): Promise<UserEntity | undefined>;
  findCompanyByName(name: string): Promise<CompanyEntity | undefined>;
  findPlanByName(name: string): Promise<PlanEntity | undefined>;
  createCompany(data: CreateCompanyData): Promise<CompanyEntity>;
  createUser(data: CreateUserCriteria): Promise<UserEntity>;
  // createSubscription(data: CreateSubscriptionData): Promise<SubscriptionEntity>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
  sendInviteEmail(email: string, activationLink: string): Promise<boolean>;
  generateActivationToken(userId: number): Promise<string>;
  signToken(user: Partial<UserEntity>): string;
}
