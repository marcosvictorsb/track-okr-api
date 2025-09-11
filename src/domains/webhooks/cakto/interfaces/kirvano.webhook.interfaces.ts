import { KirvanoWebhookInteractor } from '../usecases/kirvano.webhook.interactor';
import { IPresenter } from '@protocols/presenter';
import { CompanyEntity } from '@domains/api/companies/entity/company.entity';
import { PlanEntity } from '@domains/api/backoffice/entities/plan.entity';

import {
  FindCompanyCriteria,
  ICompanyRepository
} from '@domains/api/companies/interfaces';
import {
  FindPlansCriteria,
  IPlanRepository
} from '@domains/api/backoffice/interfaces/default.interfaces';
import { DataLogOutput } from '@adapters/services';
import {
  CreateSettingCriteria,
  CreateWebhookCriteria,
  IWebhookRepository,
  WebhookEntity
} from '@domains/common';
import { CreateCompanyData } from '@domains/api/authentication/interfaces';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  CreateUserCriteria,
  FindUserCriteria,
  IUserRepository
} from '@domains/api/users/interfaces';
import { ISettingRepository, SettingEntity } from '@domains/api/settings';
import {
  CreateSubscriptionCriteria,
  CreateSubscriptionHistoryCriteria,
  FindSubscriptionsCriteria,
  ISubscriptionHistoryRepository,
  ISubscriptionRepository,
  UpdateSubscriptionCriteria
} from '@domains/common/subscriptions/interfaces';
import { SubscriptionEntity } from '@domains/common/subscriptions/entity/subscription.entity';
import { Resend } from 'resend';

export enum EventsKirvanoWebhook {
  SALE_APPROVED = 'SALE_APPROVED',
  SALE_REFUSED = 'SALE_REFUSED',
  SALE_REFUNDED = 'SALE_REFUNDED',
  SUBSCRIPTION_RENEWED = 'SUBSCRIPTION_RENEWED',
  SUBSCRIPTION_EXPIRED = 'SUBSCRIPTION_EXPIRED',
  SUBSCRIPTION_CANCELED = 'SUBSCRIPTION_CANCELED',
  ABANDONED_CART = 'ABANDONED_CART'
}

export enum KirvanoWebhookStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  FAILED = 'failed',
  NOT_SALES_APPROVED = 'not_sales_approved',
  NOT_FOUND_PLAN = 'not_found_plan',
  SUCCESS = 'success',
  COMPANY_ALREADY_EXISTS = 'company_already_exists'
}

type Product = {
  id: string;
  name: string;
  offer_id?: string;
  offer_name?: string;
  description?: string;
  price?: string;
  photo?: string;
  is_order_bump?: false;
};

export interface KirvanoWebhookPayload {
  source?: string;
  event?: string;
  event_description?: string;
  description?: string;
  json?: string;
  created?: Date;
  id?: string;
  checkout_id?: string;
  sale_id?: string;
  payment_method?: string;
  total_price?: string;
  type?: string;
  status?: string;
  created_at?: string;
  customer: {
    name: string;
    document: string;
    email: string;
    phone_number: string;
  };
  payment?: {
    method?: string;
    brand?: string;
    installments?: 1;
    finished_at?: string;
  };
  plan?: {
    name?: string;
    charge_frequency?: string;
    next_charge_date?: string;
  };
  products: Product[];
  utm?: {
    src?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  };
}

export interface IKirvanoWebhookGateway {
  saveWebhook(data: CreateWebhookCriteria): Promise<WebhookEntity>;
  findPlan(criteria: FindPlansCriteria): Promise<PlanEntity | undefined>;
  findCompany(
    criteria: FindCompanyCriteria
  ): Promise<CompanyEntity | undefined>;
  createCompany(data: CreateCompanyData): Promise<CompanyEntity>;
  findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined>;
  createUser(criteria: Partial<CreateUserCriteria>): Promise<UserEntity>;
  createCompanySettings(
    criteria: CreateSettingCriteria
  ): Promise<SettingEntity>;

  // subscription
  createSubscription(
    criteria: CreateSubscriptionCriteria
  ): Promise<SubscriptionEntity>;
  createSubscriptionHistory(
    data: CreateSubscriptionHistoryCriteria
  ): Promise<void>;
  findSubscription(
    criteria: FindSubscriptionsCriteria
  ): Promise<SubscriptionEntity | undefined>;
  updateSubscription(
    updateData: Partial<UpdateSubscriptionCriteria>,
    criteria: UpdateSubscriptionCriteria
  ): Promise<boolean>;

  // Email operations
  generateActivationToken(userId: number): Promise<string>;
  signToken(data: {
    name: string;
    email: string;
    id: number;
    id_company: number;
  }): string;
  sendInviteEmail(email: string, activationLink: string): Promise<boolean>;
  // Logs methods
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export type IKirvanoWebhookInteractorDependencies = {
  gateway: IKirvanoWebhookGateway;
  presenter: IPresenter;
};

export type KirvanoWebhookGatewayDependencies = {
  logging: typeof import('@configs/logger').logger;
  userRepository: IUserRepository;
  companyRepository: ICompanyRepository;
  planRepository: IPlanRepository;
  subscriptionRepository: ISubscriptionRepository;
  subscriptionHistoryRepository: ISubscriptionHistoryRepository;
  settingRepository: ISettingRepository;
  webhookRepository: IWebhookRepository;
  resendService: Resend;
};

export type KirvanoWebhookControllerDependencies = {
  interactor: KirvanoWebhookInteractor;
};
