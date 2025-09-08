import { logger } from '@configs/logger';
import {
  CreateCompanyData,
  IKirvanoWebhookGateway,
  KirvanoWebhookGatewayDependencies
} from '../interfaces';
import {
  FindPlansCriteria,
  IPlanRepository
} from '@domains/api/backoffice/interfaces/default.interfaces';
import { PlanEntity } from '@domains/api/backoffice/entities/plan.entity';
import {
  FindCompanyCriteria,
  ICompanyRepository
} from '@domains/api/companies/interfaces';
import { CompanyEntity } from '@domains/api/companies/entity/company.entity';
import {
  CreateSettingCriteria,
  CreateWebhookCriteria,
  IWebhookRepository,
  WebhookEntity
} from '@domains/common';
import {
  CreateUserCriteria,
  FindUserCriteria,
  IUserRepository,
  UserStatus
} from '@domains/api/users/interfaces';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import crypto from 'crypto';
import { ISettingRepository, SettingEntity } from '@domains/api/settings';
import { SubscriptionEntity } from '@domains/common/subscriptions/entity/subscription.entity';
import {
  CreateSubscriptionCriteria,
  CreateSubscriptionHistoryCriteria,
  FindSubscriptionsCriteria,
  ISubscriptionHistoryRepository,
  ISubscriptionRepository,
  UpdateSubscriptionCriteria
} from '@domains/common/subscriptions/interfaces';
import { MixKirvanoWebhookGateway } from '@adapters/gateways/webhook/cakto/kirvano.webhook.gateway';

export class KirvanoWebhookGateway
  extends MixKirvanoWebhookGateway
  implements IKirvanoWebhookGateway
{
  logging: typeof logger;
  private userRepository: IUserRepository;
  private companyRepository: ICompanyRepository;
  private planRepository: IPlanRepository;
  private subscriptionRepository: ISubscriptionRepository;
  private subscriptionHistoryRepository: ISubscriptionHistoryRepository;
  private settingRepository: ISettingRepository;
  private webhookRepository: IWebhookRepository;

  constructor(params: KirvanoWebhookGatewayDependencies) {
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
  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    this.logging.info('Buscando usuário por email', { email: criteria.email });
    return await this.userRepository.find({ email: criteria.email });
  }

  async createUser(data: Partial<CreateUserCriteria>): Promise<UserEntity> {
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

    const userData: CreateUserCriteria = {
      name: data.name as string,
      email: data.email as string,
      id_company: data.id_company as number,
      status: UserStatus.PENDING_ACTIVATION,
      role: 'admin',
      password_hash: password_hash as string
    };

    return await this.userRepository.create(userData);
  }

  // // Company operations
  async findCompany(
    criteria: FindCompanyCriteria
  ): Promise<CompanyEntity | undefined> {
    this.logging.info('Buscando empresa por: ', { criteria });
    return await this.companyRepository.find({ cnpj: criteria.cnpj });
  }

  async createCompany(data: CreateCompanyData): Promise<CompanyEntity> {
    this.logging.info('Criando nova empresa', { name: data.name });
    return await this.companyRepository.create(data);
  }

  // // Plan operations
  // async findPlanByProductId(
  //   productId: string
  // ): Promise<PlanEntity | undefined> {
  //   this.logging.info('Buscando plano por ID do produto', { productId });
  //   // Aqui você pode mapear o productId do Cakto para os planos internos
  //   // Por exemplo: productId "2" = "Plano Pro"
  //   const planMap: Record<string, string> = {
  //     '1': 'Gratuito',
  //     '2': 'Pro',
  //     '3': 'Enterprise'
  //   };

  //   const planName = planMap[productId];
  //   if (!planName) {
  //     return undefined;
  //   }

  //   return await this.planRepository.find({ name: planName });
  // }

  async findPlan(criteria: FindPlansCriteria): Promise<PlanEntity | undefined> {
    this.logging.info('Buscando plano por: ', { criteria });
    return await this.planRepository.find(criteria);
  }

  // // Subscription operations
  // async findActiveSubscriptionByCompany(
  //   companyId: number
  // ): Promise<SubscriptionEntity | undefined> {
  //   this.logging.info('Buscando subscription ativa por empresa', { companyId });
  //   return await this.subscriptionRepository.find({
  //     company_id: companyId,
  //     status: 'active'
  //   });
  // }

  async createSubscription(
    criteria: CreateSubscriptionCriteria
  ): Promise<SubscriptionEntity> {
    this.logging.info('Criando nova subscription', {
      data: JSON.stringify(criteria)
    });

    return await this.subscriptionRepository.create(criteria);
  }

  async findSubscription(
    criteria: FindSubscriptionsCriteria
  ): Promise<SubscriptionEntity | undefined> {
    this.logging.info('Buscando subscription por: ', { criteria });
    return await this.subscriptionRepository.find(criteria);
  }

  async updateSubscription(
    updateData: Partial<UpdateSubscriptionCriteria>,
    criteria: UpdateSubscriptionCriteria
  ): Promise<boolean> {
    this.logging.info('Atualizando subscription', {
      criteriaUpdated: criteria,
      updateData
    });

    return await this.subscriptionRepository.update(updateData, criteria);
  }

  // // Email operations
  async generateActivationToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    this.logging.info('Token de ativação gerado', { userId, token });
    return token;
  }

  // // Payment history
  // async createPaymentHistory(
  //   data: CreatePaymentHistoryData
  // ): Promise<{ id: number; created_at: Date } & CreatePaymentHistoryData> {
  //   this.logging.info('Criando histórico de pagamento', {
  //     company_id: data.company_id,
  //     external_payment_id: data.external_payment_id,
  //     amount: data.amount
  //   });

  //   // Aqui você criaria uma tabela de histórico de pagamentos se necessário
  //   // Por enquanto, apenas retorna os dados
  //   return {
  //     id: Date.now(),
  //     ...data,
  //     created_at: new Date()
  //   };
  // }

  // // Subscription history
  async createSubscriptionHistory(
    data: CreateSubscriptionHistoryCriteria
  ): Promise<void> {
    this.logging.info('Criando histórico de subscription', {
      data: JSON.stringify(data)
    });

    await this.subscriptionHistoryRepository.create(data);
  }

  // // Settings operations
  async createCompanySettings(
    data: CreateSettingCriteria
  ): Promise<SettingEntity> {
    this.logging.info('Criando configurações da empresa', {
      request: JSON.stringify(data)
    });
    return await this.settingRepository.create(data);
  }

  async saveWebhook(data: CreateWebhookCriteria): Promise<WebhookEntity> {
    this.logging.info('Salvando webhook da kirvano', {
      source: 'kirvano',
      description: data.description || 'Sem descrição',
      status: data?.status || 'desconhecido'
    });

    const createWebhookCriteria: CreateWebhookCriteria = {
      source: 'kirvano',
      description: data.description || 'Sem descrição',
      json: JSON.stringify(data),
      status: data?.status || 'desconhecido',
      created: data?.created ? new Date(data.created) : new Date()
    };

    // Aqui você pode usar o repositório de webhooks para salvar os dados
    return await this.webhookRepository.create(createWebhookCriteria);
  }
}
