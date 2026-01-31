import { PlanEntity } from '@domains/api/backoffice/entities/plan.entity';
import { CompanyEntity } from '@domains/api/companies/entity/company.entity';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { UserStatus } from '@domains/api/users/interfaces';
import { CreateSettingCriteria, WEBHOOK_STATUS } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { Utils } from '@shared/utils/utils';
import {
  CaktoWebhookPayload,
  IPurchaseApprovedGateway,
  IPurchaseApprovedInteractorDependencies
} from '../interfaces/purchase.approved.interfaces';

export class PurchaseApprovedInteractor {
  protected gateway: IPurchaseApprovedGateway;
  protected presenter: IPresenter;

  constructor(params: IPurchaseApprovedInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  async execute(payload: CaktoWebhookPayload): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Processando webhook de compra aprovada', {
        event: payload.event,
        customer_email: payload.data.customer.email,
        offer_name: payload.data.offer.name,
        plan: payload.data.product.name,
        amount: payload.data.amount
      });

      if (payload.event !== 'purchase_approved') {
        this.gateway.saveWebhook({
          source: 'cakto',
          description: 'Não é um evento do tipo purchase_approved',
          json: JSON.stringify(payload),
          status: WEBHOOK_STATUS.PENDING,
          created: new Date()
        });
        this.gateway.loggerInfo('Evento ignorado', { event: payload.event });
        return this.presenter.ok('Evento ignorado');
      }

      const plan = await this.gateway.findPlan({ secret: payload.secret });
      if (!plan) {
        this.gateway.loggerError('Plano não encontrado para o secret', {
          secret: payload.secret,
          product_id: payload.data.product.id,
          offer_name: payload.data.offer.name
        });
        this.gateway.saveWebhook({
          source: 'cakto',
          description: 'Plano não encontrado para o secret',
          json: JSON.stringify(payload),
          status: WEBHOOK_STATUS.PENDING,
          created: new Date()
        });
        this.gateway.loggerInfo('Evento ignorado', { event: payload.event });
        return this.presenter.ok('Evento ignorado');
      }

      const {
        customer,
        offer: _offer,
        product: _product,
        subscription
      } = payload.data;

      const companyData = {
        name: `${customer.name} - Empresa criada automaticamente`,
        cnpj: Utils.truncateString(
          `${customer.name} / ${customer.docNumber} / ${new Date().getTime()}`,
          100
        ),
        description: `Empresa criada automaticamente para ${customer.name}`,
        segment: 'Geral'
      };

      const company = await this.gateway.createCompany(companyData);
      this.gateway.loggerInfo('Empresa criada', {
        id_company: company.id,
        company_name: company.name
      });

      const userData = {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        cpf: customer.docNumber,
        id_company: company.id as number,
        status: UserStatus.PENDING_ACTIVATION,
        user_type: 'admin'
      };

      const user = await this.gateway.createUser(userData);
      this.gateway.loggerInfo('Usuário criado', {
        id_user: user.id,
        email: user.email
      });

      const dataSettings: CreateSettingCriteria = {
        id_company: company.id as number,
        block_okr_creation: true,
        block_key_result_creation: true,
        block_okr_editing: true,
        block_key_result_editing: true,
        allowed_quarters: [1, 2, 3, 4],
        current_quarter_only: true
      };
      await this.gateway.createCompanySettings(dataSettings);

      this.gateway.loggerInfo('Configurações padrão criadas para a empresa', {
        id_company: company.id
      });

      const subscriptionData = {
        company_id: company.id as number,
        plan_id: plan.id as number,
        status: 'active' as const,
        started_at: new Date(payload.data.paidAt),
        expires_at: new Date(subscription?.next_payment_date),
        external_subscription_id: subscription.id,
        amount: parseFloat(payload.data.amount.toString()),
        auto_renew: true,
        trial_start_date: null,
        trial_end_date: null
      };

      const newSubscription =
        await this.gateway.createSubscription(subscriptionData);

      await this.gateway.createSubscriptionHistory({
        subscription_id: newSubscription.id as number,
        action: 'created',
        new_status: 'active',
        new_plan_id: plan.id as number,
        reason: 'Subscription criada via webhook Cakto',
        metadata: {
          payload
        },
        automated: true,
        notes: `Subscription criada automaticamente via webhook de pagamento`
      });

      this.gateway.loggerInfo('Subscription criada', {
        subscription_id: newSubscription.id
      });

      await this.sendActivationEmail(user, company, plan);

      this.gateway.saveWebhook({
        source: 'cakto',
        description: 'Webhook de compra aprovada processado com sucesso',
        json: JSON.stringify(payload),
        status: WEBHOOK_STATUS.SUCCESS,
        created: new Date()
      });
      this.gateway.loggerInfo('Webhook salvo', { event: payload.event });

      return this.presenter.ok({
        message: 'Pagamento processado com sucesso'
      });
    } catch (error: unknown) {
      this.gateway.loggerError('Erro ao processar webhook de pagamento', {
        error: (error as Error).message,
        stack: (error as Error).stack
      });
      this.gateway.saveWebhook({
        source: 'cakto',
        description: 'Erro ao processar webhook de pagamento',
        json: JSON.stringify(payload),
        status: WEBHOOK_STATUS.SUCCESS,
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
      const _activationToken = await this.gateway.generateActivationToken(
        user.id!
      );

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
      this.gateway.loggerError('Erro ao enviar email de ativação', {
        error: (error as Error).message,
        id_user: user.id
      });
    }
  }
}
