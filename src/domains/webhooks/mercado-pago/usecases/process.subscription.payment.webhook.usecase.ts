import { IPresenter } from '@protocols/presenter';
import { HttpResponse } from '@protocols/http';
import {
  InputProcessSubscriptionPaymentWebhooks,
  ProcessSubscriptionPaymentWebhookInteractorDependencies
} from '../interfaces/';
import { ProcessSubscriptionPaymentGateway } from '../gateways';
import { SubscriptionStatus } from '@domains/api/subscriptions/interfaces/default.interfaces';
import { Utils } from '@shared/utils/utils';
import * as dotenv from 'dotenv';
dotenv.config();

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

      const paymentId = Math.floor(Math.random() * 10000);
      const paymentDetails = this.getRandomPaymentDetails();

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

      const randomPassword = Utils.generateRandomPassword();
      const user = await this.gateway.createUser({
        email: paymentDetails.payer.email,
        id_company: company.id as number,
        name: `${paymentDetails.payer.first_name} ${paymentDetails.payer.last_name}`,
        password_hash: randomPassword,
        role: 'admin',
        status: 'pending_activation'
      });

      if (!user) {
        this.gateway.loggerInfo('Erro ao criar usuário admin');
        return this.presenter.ok('Erro ao criar usuário admin');
      }

      this.gateway.loggerInfo('Assinatura e usuário criados com sucesso', {
        id_company: company.id,
        amount_users: amountUsers
      });

      const templateName = 'admin-created.template.html';
      const variables = {
        companyName: company.name,
        adminName: user.name as string,
        adminEmail: user.email as string,
        adminPassword: randomPassword,
        baseUrl:
          process.env.NODE_ENV === 'production'
            ? (process.env.PRODUCTION_BASE_URL as string)
            : (process.env.DEVELOPMENT_BASE_URL as string)
      };
      const emailContent = Utils.loadEmailTemplate(templateName, variables);

      const subject = 'Usuário administrador criado com sucesso';
      this.gateway.sendEmail(subject, 'marcosvictorsb@gmail.com', emailContent);

      return this.presenter.ok({
        message: 'Company, admin user, and subscription created successfully.'
      });
    } catch (error) {
      this.gateway.loggerError('Erro no processo de assinatura do cliente', {
        error
      });
      return this.presenter.serverError(
        'Erro no processo de assinatura do cliente'
      );
    }
  }

  private getRandomPaymentDetails() {
    const randomId = Math.floor(Math.random() * 10000);

    // Gera um CNPJ válido (formato válido, mas números aleatórios)
    function generateRandomCNPJ() {
      let cnpj = '';
      for (let i = 0; i < 12; i++) {
        cnpj += Math.floor(Math.random() * 10);
      }
      // Calcula os dígitos verificadores (simplificado para exemplo)
      cnpj += '0001';
      return cnpj;
    }

    return {
      status: 'approved',
      transaction_amount: 150,
      payer: {
        email: `cliente${randomId}@empresa.com.br`,
        first_name: `Empresa${randomId}`,
        last_name: `Exemplo LTDA ${randomId}`,
        identification: {
          type: 'CNPJ',
          number: generateRandomCNPJ()
        }
      }
    };
  }
}
