import { HttpResponse } from '@protocols/http';
import {
  IPurchaseApprovedGateway,
  IPurchaseApprovedInteractorDependencies,
  CaktoWebhookPayload
} from '../interfaces/purchase.approved.interfaces';
import { IPresenter } from '@protocols/presenter';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { CompanyEntity } from '@domains/api/companies/entity/company.entity';
import { PlanEntity } from '@domains/api/backoffice/entities/plan.entity';
import { UserStatus } from '@domains/api/users/interfaces';
import { Utils } from '@shared/utils/utils';

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

      // 1. Processar apenas eventos de compra aprovada
      if (payload.event !== 'purchase_approved') {
        this.gateway.loggerInfo('Evento ignorado', { event: payload.event });
        return this.presenter.ok('Evento ignorado');
      }

      // 1. Verificar se o plano existe
      const plan = await this.gateway.findPlan({ secret: payload.secret });
      if (!plan) {
        this.gateway.loggerError('Plano não encontrado para o secret', {
          secret: payload.secret,
          product_id: payload.data.product.id,
          offer_name: payload.data.offer.name
        });
        return this.presenter.ok('Evento ignorado');
      }

      const {
        customer,
        offer: _offer,
        product: _product,
        subscription
      } = payload.data;

      // 3. Verificar se usuário já existe
      let user = await this.gateway.findUserByEmail(customer.email);
      let company;

      if (user) {
        this.gateway.loggerInfo('Usuário existente encontrado', {
          id_user: user.id,
          email: customer.email
        });

        // Buscar empresa do usuário
        company = await this.gateway.findCompanyByUserId(user.id!);
      } else {
        // 4. Criar empresa primeiro
        const companyData = {
          name: `${customer.name} - Empresa`,
          cnpj: this.generateRandomCNPJ(),
          description: `Empresa criada automaticamente para ${customer.name}`,
          segment: 'Geral'
        };

        company = await this.gateway.createCompany(companyData);
        this.gateway.loggerInfo('Empresa criada', {
          id_company: company.id,
          company_name: company.name
        });

        // 5. Criar usuário
        const userData = {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          cpf: customer.docNumber,
          id_company: company.id!,
          status: UserStatus.PENDING_ACTIVATION,
          user_type: 'admin'
        };

        user = await this.gateway.createUser(userData);
        this.gateway.loggerInfo('Usuário criado', {
          id_user: user.id,
          email: user.email
        });
      }

      // 7. Verificar se já existe subscription ativa
      const existingSubscription =
        await this.gateway.findActiveSubscriptionByCompany(company.id!);

      if (existingSubscription) {
        // Atualizar subscription existente
        const previousPlanId = existingSubscription.plan_id;
        const previousStatus = existingSubscription.status;

        await this.gateway.updateSubscription(existingSubscription.id!, {
          plan_id: plan.id!,
          status: 'active',
          started_at: new Date(payload.data.paidAt),
          expires_at: new Date(subscription.next_payment_date),
          external_subscription_id: subscription.id,
          amount: parseFloat(payload.data.amount.toString()),
          updated_at: new Date()
        });

        // Registrar no histórico da subscription
        if (previousPlanId !== plan.id) {
          // Mudança de plano
          await this.gateway.createSubscriptionHistory({
            subscription_id: existingSubscription.id!,
            action: 'plan_changed',
            previous_status: previousStatus,
            new_status: 'active',
            previous_plan_id: previousPlanId,
            new_plan_id: plan.id!,
            reason: 'Mudança de plano via webhook Cakto',
            metadata: {
              payload
            },
            automated: true,
            notes: `Plano alterado via webhook de pagamento recorrente`
          });
        } else {
          // Renovação
          await this.gateway.createSubscriptionHistory({
            subscription_id: existingSubscription.id!,
            action: 'renewed',
            previous_status: previousStatus,
            new_status: 'active',
            reason: 'Renovação via webhook Cakto',
            metadata: {
              payload
            },
            automated: true,
            notes: `Subscription renovada via webhook de pagamento recorrente`
          });
        }

        this.gateway.loggerInfo('Subscription atualizada', {
          subscription_id: existingSubscription.id
        });
      } else {
        // 8. Criar nova subscription
        const subscriptionData = {
          company_id: company.id!,
          plan_id: plan.id!,
          status: 'active' as const,
          started_at: new Date(payload.data.paidAt),
          expires_at: new Date(subscription.next_payment_date),
          external_subscription_id: subscription.id,
          amount: parseFloat(payload.data.amount.toString()),
          auto_renew: true,
          trial_start_date: null,
          trial_end_date: null
        };

        const newSubscription =
          await this.gateway.createSubscription(subscriptionData);

        // Registrar criação no histórico
        await this.gateway.createSubscriptionHistory({
          subscription_id: newSubscription.id!,
          action: 'created',
          new_status: 'active',
          new_plan_id: plan.id!,
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
      }

      // 9. Enviar email de ativação se usuário ainda não está ativo
      if (user.status === 'pending_activation') {
        await this.sendActivationEmail(user, company, plan);

        // Registrar ativação no histórico se uma subscription foi criada
        const currentSubscription =
          existingSubscription ||
          (await this.gateway.findActiveSubscriptionByCompany(company.id!));

        if (currentSubscription) {
          await this.gateway.createSubscriptionHistory({
            subscription_id: currentSubscription.id!,
            action: 'activated',
            new_status: 'active',
            reason: 'Email de ativação enviado via webhook Cakto',
            metadata: {
              payload
            },
            automated: true,
            notes: `Email de ativação enviado para usuário ${user.email}`
          });
        }
      }

      // 10. Registrar histórico de pagamento (opcional)
      await this.gateway.createPaymentHistory({
        company_id: company.id!,
        user_id: user.id!,
        external_payment_id: payload.data.id,
        external_subscription_id: subscription.id,
        amount: parseFloat(payload.data.amount.toString()),
        payment_method: payload.data.paymentMethod,
        status: payload.data.status,
        paid_at: new Date(payload.data.paidAt),
        webhook_data: JSON.stringify(payload.data)
      });

      return this.presenter.ok({
        message: 'Pagamento processado com sucesso',
        user_id: user.id,
        company_id: company.id
      });
    } catch (error: unknown) {
      this.gateway.loggerError('Erro ao processar webhook de pagamento', {
        error: (error as Error).message,
        stack: (error as Error).stack
      });
      return this.presenter.serverError('Erro interno do servidor');
    }
  }

  private generateRandomCNPJ(): string {
    // Gera os 8 primeiros dígitos
    const base = Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, '0');
    // Adiciona filial (0001)
    const cnpjBase = base + '0001';

    // Calcula primeiro dígito verificador
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpjBase[i]) * weights1[i];
    }
    const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    // Calcula segundo dígito verificador
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const cnpjWithFirstDigit = cnpjBase + digit1;
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpjWithFirstDigit[i]) * weights2[i];
    }
    const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    return cnpjBase + digit1 + digit2;
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
