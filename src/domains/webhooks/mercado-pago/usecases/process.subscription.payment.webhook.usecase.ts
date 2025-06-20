import { IPresenter } from '@protocols/presenter';
import { HttpResponse } from '@protocols/http';
import {
  InputProcessSubscriptionPaymentWebhooks,
  ProcessSubscriptionPaymentWebhookInteractorDependencies
} from '../interfaces/';
import { ProcessSubscriptionPaymentGateway } from '../gateways';
import { SubscriptionStatus } from '@domains/api/subscriptions/interfaces/default.interfaces';

export class ProcessSubscriptionPaymentWebhookInteractor {
  protected gateway: ProcessSubscriptionPaymentGateway;
  protected presenter: IPresenter;

  constructor(params: ProcessSubscriptionPaymentWebhookInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  async execute(
    input: InputProcessSubscriptionPaymentWebhooks
  ): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Iniciando o processo de assinatura do cliente', {
        requestTxt: JSON.stringify(input)
      });
      const { action, data } = input;

      if (action !== 'payment.created') {
        return this.presenter.ok('Ignoring non-payment event');
      }

      const paymentId = data.id;
      const paymentDetails = {
        status: 'approved',
        transaction_amount: 150,
        payer: {
          email: 'cliente@empresa.com.br',
          first_name: 'Empresa',
          last_name: 'Exemplo LTDA',
          identification: {
            type: 'CNPJ',
            number: '12345678000199'
          }
        }
      };

      if (paymentDetails.status !== 'approved') {
        return this.presenter.ok('Payment not approved, ignoring');
      }

      const amountPaid = paymentDetails.transaction_amount;
      const unitPrice = 15;
      const amountUsers = Math.floor(amountPaid / unitPrice);

      if (amountUsers < 1) {
        this.gateway.loggerInfo(
          'Valor do pagamento muito baixo para qualquer usuário'
        );
        return this.presenter.badRequest(
          'Payment amount too low for any users'
        );
      }

      const cnpj = paymentDetails.payer.identification.number;
      const companyName =
        paymentDetails.payer.first_name + ' ' + paymentDetails.payer.last_name;

      const companyExist = await this.gateway.findCompany({ cnpj });

      if (companyExist) {
        this.gateway.loggerInfo('Empresa já cadastrada');
        return this.presenter.badRequest('Empresa já cadastrada');
      }

      const company = await this.gateway.createCompany({
        name: companyName,
        cnpj
      });

      if (!company) {
        this.gateway.loggerError('Erro ao criar empresa');
        return this.presenter.ok('Payment not approved, ignoring');
      }

      // Criar assinatura
      this.gateway.loggerInfo('Criando assinatura para a empresa', {
        id_company: company.id,
        amount_users: amountUsers
      });

      await this.gateway.createSubscription({
        id_company: company.id as number,
        amount_users: amountUsers,
        status: SubscriptionStatus.ACTIVE,
        id_external_payment: paymentId as unknown as string
      });

      // Criar usuário admin
      this.gateway.loggerInfo('Criando usuário admin para a empresa', {
        id_company: company.id,
        email: paymentDetails.payer.email
      });

      await this.gateway.createUser({
        email: paymentDetails.payer.email,
        id_company: company.id as number,
        name: `${paymentDetails.payer.first_name} ${paymentDetails.payer.last_name}`,
        password_hash: 'temporario',
        role: 'admin',
        status: 'pending_activation'
      });

      return this.presenter.ok({
        message: 'Company, admin user, and subscription created successfully.'
      });
    } catch (error) {
      console.log(error);
      this.gateway.loggerError('Erro no processo de assinatura do cliente', {
        error
      });
      return this.presenter.serverError(
        'Erro no processo de assinatura do cliente'
      );
    }
  }
}
