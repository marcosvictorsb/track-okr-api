import { PlanEntity } from '@domains/api/backoffice/entities/plan.entity';
import { CompanyEntity } from '@domains/api/companies/entity/company.entity';
import { CreateCompanyCriteria } from '@domains/api/companies/interfaces';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { CreateUserCriteria } from '@domains/api/users/interfaces';
import { CreateSettingCriteria } from '@domains/common';
import {
  CreateSubscriptionCriteria,
  SubscriptionStatus
} from '@domains/common/subscriptions/interfaces';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { Utils } from '@shared/utils/utils';
import { KirvanoWebhookPayload } from '../interfaces';
import {
  EventsKirvanoWebhook,
  IKirvanoWebhookGateway,
  IKirvanoWebhookInteractorDependencies,
  KirvanoWebhookStatus
} from '../interfaces/kirvano.webhook.interfaces';

export class KirvanoWebhookInteractor {
  protected gateway: IKirvanoWebhookGateway;
  protected presenter: IPresenter;

  constructor(params: IKirvanoWebhookInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  async execute(payload: KirvanoWebhookPayload): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Processando webhook da Kirvano', {
        data: JSON.stringify(payload)
      });

      await this.gateway.sendDiscordNotification({
        event: payload.event,
        status: payload.status,
        customer_email: payload.customer?.email,
        customer_document: payload.customer?.document,
        payment: payload.payment,
        products: payload.products
      });

      switch (payload.event) {
        case EventsKirvanoWebhook.SALE_APPROVED:
          this.gateway.loggerInfo('Evento de venda aprovada recebido', {
            event: payload.event
          });
          return await this.handleSaleApproved(payload);
        case EventsKirvanoWebhook.SUBSCRIPTION_RENEWED:
          this.gateway.loggerInfo('Evento para renovar assinatura', {
            event: payload.event
          });
          return await this.subscriptionRenewed(payload);
        default:
          await this.handleUnknownEvent(payload);
          this.gateway.loggerInfo('Evento ignorado', { event: payload.event });
          return this.presenter.ok('Evento ignorado');
      }
    } catch (error: unknown) {
      this.gateway.loggerError('Erro ao processar webhook de pagamento', {
        error: (error as Error).message,
        stack: (error as Error).stack
      });
      await this.gateway.saveWebhook({
        source: 'cakto',
        description: 'Erro ao processar webhook de pagamento',
        json: JSON.stringify(payload),
        status: KirvanoWebhookStatus.FAILED,
        created: new Date()
      });
      this.gateway.loggerInfo('Webhook salvo', { event: payload.event });
      return this.presenter.ok();
    }
  }

  private async sendActivationEmail(
    user: UserEntity,
    company: CompanyEntity,
    plan: PlanEntity
  ): Promise<void> {
    try {
      const templateName = 'activate-after-subscription.template.html';

      const token = this.gateway.signToken({
        name: user.name,
        email: user.email as string,
        id: user.id as number,
        id_company: company.id as number
      });

      const variables = {
        userName: user.name,
        baseUrl:
          process.env.NODE_ENV === 'production'
            ? (process.env.PRODUCTION_BASE_URL as string)
            : (process.env.DEVELOPMENT_BASE_URL as string),
        token,
        planName: plan.name,
        maxUsers: String(plan.max_users),
        maxPlanners: String(plan.max_planners),
        maxTeams: String(plan.max_teams),
        maxObjectives: String(plan.max_objectives_per_quarter),
        maxKeyResults: String(plan.max_key_results_per_objective),
        currentYear: String(new Date().getFullYear())
      };

      const emailContent = Utils.loadEmailTemplate(templateName, variables);

      await this.gateway.sendInviteEmail(user.email, emailContent);

      this.gateway.loggerInfo('Email de ativação enviado', {
        id_user: user.id,
        email: user.email
      });
    } catch (error) {
      console.log(error);
      this.gateway.loggerError('Erro ao enviar email de ativação', {
        error: (error as Error).message,
        id_user: user.id
      });
    }
  }

  private async handleSaleApproved(
    payload: KirvanoWebhookPayload
  ): Promise<HttpResponse> {
    const plan = await this.gateway.findPlan({
      name: payload.products[0].offer_name as string
    });

    if (!plan) {
      this.gateway.loggerError(
        `Plano não encontrado nome: ${payload.plan?.name}`
      );
      await this.gateway.saveWebhook({
        source: 'kirvano',
        description: 'Plano não encontrado',
        json: JSON.stringify(payload),
        status: KirvanoWebhookStatus.NOT_FOUND_PLAN as string,
        created: new Date()
      });
      this.gateway.loggerInfo('Evento ignorado', { event: payload.event });

      return this.presenter.ok('Evento ignorado');
    }

    const company = await this.gateway.findCompany({
      cnpj: payload.customer?.document
    });

    if (company) {
      this.gateway.loggerInfo(
        'Empresa existe, então vamos analisar manualmente essa ação',
        { id_company: company.id, company_name: company.name }
      );
      await this.gateway.saveWebhook({
        source: 'kirvano',
        description:
          'Empresa existe, então vamos analisar manualmente essa ação',
        json: JSON.stringify(payload),
        status: KirvanoWebhookStatus.COMPANY_ALREADY_EXISTS,
        created: new Date()
      });

      return this.presenter.ok(
        'Empresa já possui cadastro e está tentando comprar novamente, analisar manualmente'
      );
    }

    const companyData: CreateCompanyCriteria = {
      name: payload.customer?.name || 'Empresa sem nome',
      cnpj: payload.customer?.document as string
    };

    const companyCreated = await this.gateway.createCompany(companyData);
    this.gateway.loggerInfo('Empresa criada', {
      id_company: companyCreated.id,
      company_name: companyCreated.name
    });

    const customer = await this.gateway.findUser({
      email: payload.customer?.email
    });

    if (customer) {
      this.gateway.loggerError(
        'Usuário existe, então não vamos criar outro usuário'
      );
    }

    const userData: Partial<CreateUserCriteria> = {
      name: payload.customer.name,
      email: payload.customer.email,
      id_company: companyCreated.id as number
    };

    const user = await this.gateway.createUser(userData);
    this.gateway.loggerInfo('Usuário criado', {
      id_user: user.id,
      email: user.email
    });

    const dataSettings: CreateSettingCriteria = {
      id_company: companyCreated.id as number,
      block_okr_creation: true,
      block_key_result_creation: true,
      block_okr_editing: true,
      block_key_result_editing: true,
      allowed_quarters: [1, 2, 3, 4],
      current_quarter_only: true
    };
    await this.gateway.createCompanySettings(dataSettings);

    this.gateway.loggerInfo('Configurações padrão criadas para a empresa', {
      id_company: companyCreated.id as number
    });

    const subscriptionData: CreateSubscriptionCriteria = {
      company_id: companyCreated.id as number,
      plan_id: plan.id as number,
      status: SubscriptionStatus.ACTIVE,
      started_at: new Date(payload.created_at as string),
      expires_at: new Date(payload.plan?.next_charge_date as string),
      auto_renew: true
    };

    const newSubscription =
      await this.gateway.createSubscription(subscriptionData);

    await this.gateway.createSubscriptionHistory({
      subscription_id: newSubscription.id as number,
      action: 'created',
      new_status: 'active',
      new_plan_id: plan.id as number,
      reason: 'Subscription criada via webhook Kirvano',
      metadata: {
        payload
      },
      automated: true,
      notes: `Subscription criada automaticamente via webhook de pagamento`
    });

    this.gateway.loggerInfo('Subscription criada', {
      subscription_id: newSubscription.id
    });

    await this.sendActivationEmail(user, companyCreated, plan);

    await this.gateway.saveWebhook({
      source: 'kirvano',
      description: 'Webhook de compra aprovada processado com sucesso',
      json: JSON.stringify(payload),
      status: KirvanoWebhookStatus.SUCCESS,
      created: new Date()
    });
    this.gateway.loggerInfo('Webhook salvo', { event: payload.event });

    return this.presenter.ok({
      message: 'Pagamento processado com sucesso'
    });
  }

  private async subscriptionRenewed(
    payload: KirvanoWebhookPayload
  ): Promise<HttpResponse> {
    this.gateway.loggerInfo('Renovação de assinatura recebida', {
      event: payload.event
    });

    const company = await this.gateway.findCompany({
      cnpj: payload.customer?.document
    });

    const findSubscription = await this.gateway.findSubscription({
      company_id: company?.id as number
    });

    const updateSubscription = {
      status: SubscriptionStatus.ACTIVE,
      expires_at: new Date(payload.plan?.next_charge_date as string)
    };

    await this.gateway.updateSubscription(updateSubscription, {
      id: findSubscription?.id as number
    });

    this.gateway.loggerInfo('Subscription renovada', {
      subscription_id: findSubscription?.id,
      new_expires_at: updateSubscription.expires_at
    });

    this.gateway.saveWebhook({
      source: 'kirvano',
      description: 'Webhook de compra aprovada processado com sucesso',
      json: JSON.stringify(payload),
      status: KirvanoWebhookStatus.SUCCESS,
      created: new Date()
    });
    this.gateway.loggerInfo('Webhook salvo', { event: payload.event });

    return this.presenter.ok({
      message: 'Renovação de assinatura processada com sucesso'
    });
  }

  private async handleUnknownEvent(
    payload: KirvanoWebhookPayload
  ): Promise<void> {
    await this.gateway.saveWebhook({
      source: 'kirvano',
      description: `Não é um evento do tipo ${EventsKirvanoWebhook.SALE_APPROVED}`,
      json: JSON.stringify(payload),
      status: KirvanoWebhookStatus.NOT_SALES_APPROVED as string,
      created: new Date()
    });
  }
}
