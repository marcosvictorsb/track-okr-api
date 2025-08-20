import { PurchaseApprovedInteractor } from '../usecases/purchase.approved.interactor';
import { IPresenter } from '@protocols/presenter';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { CompanyEntity } from '@domains/api/companies/entity/company.entity';
import { PlanEntity } from '@domains/api/backoffice/entities/plan.entity';
import { SubscriptionEntity } from '@domains/common/subscriptions/entity/subscription.entity';
import {
  ISubscriptionRepository,
  SubscriptionStatusType
} from '@domains/common/subscriptions/interfaces/default.interfaces';
import { ICompanyRepository } from '@domains/api/companies/interfaces';
import {
  FindPlansCriteria,
  IPlanRepository
} from '@domains/api/backoffice/interfaces/default.interfaces';
import { IUserRepository } from '@domains/api/users/interfaces';
import { DataLogOutput } from '@adapters/services';

export type IPurchaseApprovedInteractorDependencies = {
  gateway: IPurchaseApprovedGateway;
  presenter: IPresenter;
};

export interface CaktoWebhookPayload {
  secret: string;
  event: string;
  data: {
    id: string;
    refId: string;
    customer: {
      name: string;
      email: string;
      phone: string;
      docNumber: string;
      birthDate?: string;
    };
    affiliate: string;
    offer: {
      id: string;
      name: string;
      price: number;
    };
    offer_type: string;
    product: {
      id: string;
      name: string;
      short_id: string;
      supportEmail: string;
      type: string;
      invoiceDescription: string;
    };
    parent_order: string;
    subscription: {
      id: string;
      status: string;
      current_period: number;
      recurrence_period: number;
      quantity_recurrences: number;
      trial_days: number;
      max_retries: number;
      amount: string;
      retry_interval: number;
      paid_payments_quantity: number;
      parent_order: string;
      paymentMethod: string;
      customer: {
        name: string;
        email: string;
        phone: string;
        birthDate: null;
        docNumber: string;
        docType: string;
      };
      product: string;
      offer: string;
      orders: string[];
      next_payment_date: string;
      createdAt: string;
      updatedAt: string;
      canceledAt: string | null;
    };
    subscription_period: number;
    checkoutUrl: string | null;
    status: string;
    baseAmount: number;
    discount: null;
    amount: number;
    commissions: [
      {
        user: string;
        total: number;
        porcetage: number;
        type: string;
      }
    ];
    fees: number;
    couponCode: string | null;
    reason: string | null;
    refund_reason: string | null;
    paymentMethod: string;
    paymentMethodName: string;
    installments: number;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_term: string | null;
    utm_content: string | null;
    sck: string | null;
    fbc: string | null;
    fbp: string | null;
    paidAt: string;
    createdAt: string;
    refundedAt: string | null;
    chargedbackAt: string | null;
    card?: {
      holderName: string;
      lastDigits: string;
      brand: string;
    };
  };
}

export interface CreateUserData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  id_company: number;
  status: string;
  user_type: string;
  password_hash?: string;
  role?: string;
}

export interface CreateCompanyData {
  name: string;
  cnpj: string;
  description: string;
  segment: string;
}

export interface CreateSubscriptionData {
  company_id: number;
  plan_id: number;
  status: SubscriptionStatusType;
  started_at: Date;
  expires_at: Date;
  external_subscription_id: string;
  amount: number;
  auto_renew: boolean;
  trial_start_date: Date | null;
  trial_end_date: Date | null;
}

export interface UpdateSubscriptionData {
  plan_id?: number;
  status?: SubscriptionStatusType;
  started_at?: Date;
  expires_at?: Date;
  external_subscription_id?: string;
  amount?: number;
  updated_at?: Date;
}

export interface CreatePaymentHistoryData {
  company_id: number;
  user_id: number;
  external_payment_id: string;
  external_subscription_id: string;
  amount: number;
  payment_method: string;
  status: string;
  paid_at: Date;
  webhook_data: string;
}

export interface EmailVariables {
  userName: string;
  baseUrl: string;
  token: string;
  planName: string;
  maxUsers: number;
  maxPlanners: number;
  maxTeams: number;
  maxObjectives: number;
  maxKeyResults: number;
  currentYear: number;
}

export interface IPurchaseApprovedGateway {
  // User operations
  findUserByEmail(email: string): Promise<UserEntity | undefined>;
  createUser(data: CreateUserData): Promise<UserEntity>;

  // Company operations
  findCompanyByUserId(userId: number): Promise<CompanyEntity | undefined>;
  createCompany(data: CreateCompanyData): Promise<CompanyEntity>;

  // Plan operations
  findPlanByProductId(productId: string): Promise<PlanEntity | undefined>;
  findPlan(criteria: FindPlansCriteria): Promise<PlanEntity | undefined>;

  // Subscription operations
  findActiveSubscriptionByCompany(
    companyId: number
  ): Promise<SubscriptionEntity | undefined>;
  createSubscription(data: CreateSubscriptionData): Promise<SubscriptionEntity>;
  updateSubscription(
    id: number,
    data: UpdateSubscriptionData
  ): Promise<SubscriptionEntity>;

  // Email operations
  generateActivationToken(userId: number): Promise<string>;
  signToken(data: { email: string; id: number; id_company: number }): string;
  sendInviteEmail(email: string, activationLink: string): Promise<boolean>;

  // Payment history
  createPaymentHistory(
    data: CreatePaymentHistoryData
  ): Promise<{ id: number; created_at: Date } & CreatePaymentHistoryData>;

  // Subscription history
  createSubscriptionHistory(data: {
    subscription_id: number;
    action:
      | 'created'
      | 'activated'
      | 'upgraded'
      | 'downgraded'
      | 'renewed'
      | 'canceled'
      | 'expired'
      | 'suspended'
      | 'reactivated'
      | 'trial_started'
      | 'trial_extended'
      | 'trial_converted'
      | 'plan_changed'
      | 'limits_updated';
    previous_status?: string;
    new_status?: string;
    previous_plan_id?: number;
    new_plan_id?: number;
    reason?: string;
    metadata?: Record<string, unknown>;
    created_by?: number;
    automated?: boolean;
    notes?: string;
  }): Promise<void>;

  // Logs methods
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export type PurchaseApprovedGatewayDependencies = {
  logging: typeof import('@configs/logger').logger;
  userRepository: IUserRepository;
  companyRepository: ICompanyRepository;
  planRepository: IPlanRepository;
  subscriptionRepository: ISubscriptionRepository;
  subscriptionHistoryRepository: import('@domains/common/subscriptions/interfaces').ISubscriptionHistoryRepository;
};

export type PurchaseApprovedControllerDependencies = {
  interactor: PurchaseApprovedInteractor;
};
