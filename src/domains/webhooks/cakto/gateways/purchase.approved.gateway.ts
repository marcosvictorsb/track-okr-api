import { MixPurchaseApproved } from '@adapters/gateways/webhook/cakto';
import {
  IPurchaseApprovedGateway,
  PurchaseApprovedGatewayDependencies,
  CreateUserData,
  CreateCompanyData,
  CreateSubscriptionData,
  UpdateSubscriptionData,
  CreatePaymentHistoryData
} from '../interfaces/purchase.approved.interfaces';
import { logger } from '@configs/logger';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { CompanyEntity } from '@domains/api/companies/entity/company.entity';
import { PlanEntity } from '@domains/api/backoffice/entities/plan.entity';
import { SubscriptionEntity } from '@domains/common/subscriptions/entity/subscription.entity';
import { IUserRepository } from '@domains/api/users/interfaces';
import { ICompanyRepository } from '@domains/api/companies/interfaces';
import {
  FindPlansCriteria,
  IPlanRepository
} from '@domains/api/backoffice/interfaces/default.interfaces';
import {
  ISubscriptionRepository,
  SubscriptionStatus,
  ISubscriptionHistoryRepository
} from '@domains/common/subscriptions/interfaces';
import { CreateSettingCriteria } from '@domains/common/settings';
import { ISettingRepository } from '@domains/api/settings/interfaces/default.interfaces';
import crypto from 'crypto';
import { SettingEntity } from '@domains/api/settings';
import { CreateWebhookCriteria, IWebhookRepository } from '@domains/common';

export class PurchaseApprovedGateway
  extends MixPurchaseApproved
  implements IPurchaseApprovedGateway
{
  logging: typeof logger;
  private userRepository: IUserRepository;
  private companyRepository: ICompanyRepository;
  private planRepository: IPlanRepository;
  private subscriptionRepository: ISubscriptionRepository;
  private subscriptionHistoryRepository: ISubscriptionHistoryRepository;
  private settingRepository: ISettingRepository;
  private webhookRepository: IWebhookRepository;

  constructor(
    params: PurchaseApprovedGatewayDependencies & {
      userRepository: IUserRepository;
      companyRepository: ICompanyRepository;
      planRepository: IPlanRepository;
      subscriptionRepository: ISubscriptionRepository;
      subscriptionHistoryRepository: ISubscriptionHistoryRepository;
      settingRepository: ISettingRepository;
      webhookRepository: IWebhookRepository;
    }
  ) {
    super(params);
    this.logging = params.logging;
    this.userRepository = params.userRepository;
    this.companyRepository = params.companyRepository;
    this.planRepository = params.planRepository;
    this.subscriptionRepository = params.subscriptionRepository;
    this.subscriptionHistoryRepository = params.subscriptionHistoryRepository;
    this.settingRepository = params.settingRepository;
    this.webhookRepository = params.webhookRepository;
  }

  // User operations
  async findUserByEmail(email: string): Promise<UserEntity | undefined> {
    this.logging.info('Buscando usuário por email', { email });
    return await this.userRepository.find({ email });
  }

  async createUser(data: CreateUserData): Promise<UserEntity> {
    this.logging.info('Criando novo usuário', {
      name: data.name,
      email: data.email,
      id_company: data.id_company
    });

    // Gerar senha temporária
    const tempPassword = crypto.randomBytes(16).toString('hex');
    const password_hash = crypto
      .createHash('sha256')
      .update(tempPassword)
      .digest('hex');

    const userData = {
      ...data,
      password_hash,
      role: data.user_type || 'admin'
    };

    return await this.userRepository.create(userData);
  }

  // Company operations
  async findCompanyByUserId(
    userId: number
  ): Promise<CompanyEntity | undefined> {
    this.logging.info('Buscando empresa por ID do usuário', { userId });
    const user = await this.userRepository.find({ id: userId });
    if (!user || !user.id_company) {
      return undefined;
    }
    return await this.companyRepository.find({ id: user.id_company });
  }

  async createCompany(data: CreateCompanyData): Promise<CompanyEntity> {
    this.logging.info('Criando nova empresa', { name: data.name });
    return await this.companyRepository.create(data);
  }

  // Plan operations
  async findPlanByProductId(
    productId: string
  ): Promise<PlanEntity | undefined> {
    this.logging.info('Buscando plano por ID do produto', { productId });
    // Aqui você pode mapear o productId do Cakto para os planos internos
    // Por exemplo: productId "2" = "Plano Pro"
    const planMap: Record<string, string> = {
      '1': 'Gratuito',
      '2': 'Pro',
      '3': 'Enterprise'
    };

    const planName = planMap[productId];
    if (!planName) {
      return undefined;
    }

    return await this.planRepository.find({ name: planName });
  }

  async findPlan(criteria: FindPlansCriteria): Promise<PlanEntity | undefined> {
    this.logging.info('Buscando plano por: ', { criteria });
    return await this.planRepository.find(criteria);
  }

  // Subscription operations
  async findActiveSubscriptionByCompany(
    companyId: number
  ): Promise<SubscriptionEntity | undefined> {
    this.logging.info('Buscando subscription ativa por empresa', { companyId });
    return await this.subscriptionRepository.find({
      company_id: companyId,
      status: 'active'
    });
  }

  async createSubscription(
    data: CreateSubscriptionData
  ): Promise<SubscriptionEntity> {
    this.logging.info('Criando nova subscription', {
      company_id: data.company_id,
      plan_id: data.plan_id,
      status: data.status
    });

    const subscriptionData = {
      company_id: data.company_id,
      plan_id: data.plan_id,
      status:
        data.status === 'active'
          ? SubscriptionStatus.ACTIVE
          : SubscriptionStatus.SUSPENDED,
      started_at: data.started_at,
      expires_at: data.expires_at,
      trial_start_date: data.trial_start_date || undefined,
      trial_end_date: data.trial_end_date || undefined,
      auto_renew: data.auto_renew
    };

    return await this.subscriptionRepository.create(subscriptionData);
  }

  async updateSubscription(
    id: number,
    data: UpdateSubscriptionData
  ): Promise<SubscriptionEntity> {
    this.logging.info('Atualizando subscription', { id, ...data });

    let status: SubscriptionStatus | undefined = undefined;
    if (data.status === 'active') {
      status = SubscriptionStatus.ACTIVE;
    } else if (data.status === 'canceled') {
      status = SubscriptionStatus.CANCELED;
    } else if (data.status === 'suspended') {
      status = SubscriptionStatus.SUSPENDED;
    }

    const updateData = {
      id,
      plan_id: data.plan_id,
      started_at: data.started_at,
      expires_at: data.expires_at,
      external_subscription_id: data.external_subscription_id,
      amount: data.amount,
      updated_at: data.updated_at,
      status
    };

    await this.subscriptionRepository.update(updateData, updateData);

    // Buscar e retornar a subscription atualizada
    const updatedSubscription = await this.subscriptionRepository.find({ id });
    if (!updatedSubscription) {
      throw new Error('Subscription não encontrada após atualização');
    }

    return updatedSubscription;
  }

  // Email operations
  async generateActivationToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    this.logging.info('Token de ativação gerado', { userId, token });
    return token;
  }

  // Payment history
  async createPaymentHistory(
    data: CreatePaymentHistoryData
  ): Promise<{ id: number; created_at: Date } & CreatePaymentHistoryData> {
    this.logging.info('Criando histórico de pagamento', {
      company_id: data.company_id,
      external_payment_id: data.external_payment_id,
      amount: data.amount
    });

    // Aqui você criaria uma tabela de histórico de pagamentos se necessário
    // Por enquanto, apenas retorna os dados
    return {
      id: Date.now(),
      ...data,
      created_at: new Date()
    };
  }

  // Subscription history
  async createSubscriptionHistory(data: {
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
  }): Promise<void> {
    this.logging.info('Criando histórico de subscription', {
      subscription_id: data.subscription_id,
      action: data.action,
      reason: data.reason
    });

    await this.subscriptionHistoryRepository.logAction({
      subscription_id: data.subscription_id,
      action: data.action,
      previous_status: data.previous_status,
      new_status: data.new_status,
      previous_plan_id: data.previous_plan_id,
      new_plan_id: data.new_plan_id,
      reason: data.reason,
      metadata: data.metadata,
      created_by: data.created_by,
      automated: data.automated || true, // Default to automated for webhook actions
      notes: data.notes
    });
  }

  // Settings operations
  async createCompanySettings(
    data: CreateSettingCriteria
  ): Promise<SettingEntity> {
    this.logging.info('Erro ao criar configurações da empresa', {
      request: JSON.stringify(data)
    });
    return await this.settingRepository.create(data);
  }

  async saveWebhook(data: CreateWebhookCriteria): Promise<void> {
    this.logging.info('Salvando webhook', {
      source: data.source,
      description: data.description,
      status: data.status
    });

    // Aqui você pode usar o repositório de webhooks para salvar os dados
    await this.webhookRepository.create(data);
  }
}
