import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  InputRegisterFreeTrial,
  IRegisterFreeTrialGateway,
  RegisterFreeTrialInteractorDependencies
} from '../interfaces/register.free.trial.interface';
import bcrypt from 'bcryptjs';
import { CreateTrialSubscriptionInteractor } from '@domains/common/subscriptions/usecases/create.trial.subscription.interactor';
import { CreateFreeSubscriptionInput } from '@domains/common/subscriptions/interfaces';
import { Utils } from '@shared/utils/utils';

export class RegisterFreeTrialInteractor {
  protected gateway: IRegisterFreeTrialGateway;
  protected presenter: IPresenter;
  protected interactorCreateTrialSubscription: CreateTrialSubscriptionInteractor;

  constructor(params: RegisterFreeTrialInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.interactorCreateTrialSubscription =
      params.interactorCreateTrialSubscription;
  }

  async execute(input: InputRegisterFreeTrial): Promise<HttpResponse> {
    try {
      const { name, email, password, company_name, plan } = input;

      this.gateway.loggerInfo('Iniciando processo de registro', {
        data: JSON.stringify(input)
      });

      // 1. Verificar se o email já existe
      const existingUser = await this.gateway.findUserByEmail(email);
      if (existingUser) {
        this.gateway.loggerInfo('Email já cadastrado', { email });
        return this.presenter.badRequest('Email já está em uso');
      }

      // 2. Verificar se o plano existe
      const planFound = await this.gateway.findPlanByName(plan);
      if (!planFound) {
        this.gateway.loggerInfo('Plano não encontrado', { plan });
        return this.presenter.badRequest('Plano não encontrado');
      }

      this.gateway.loggerInfo('Plano encontrado', {
        plan_id: planFound.id,
        plan_name: planFound.name
      });

      // 3. Criar a empresa com CNPJ zerado inicialmente
      const companyData = {
        name: company_name,
        cnpj: `${new Date()}`, // CNPJ zerado conforme solicitado
        created_at: new Date(),
        updated_at: new Date()
      };

      const company = await this.gateway.createCompany(companyData);
      this.gateway.loggerInfo('Empresa criada com sucesso', {
        id_company: company.id,
        company_name
      });

      // 4. Criar o usuário administrador
      const hashedPassword = await bcrypt.hash(password, 10);
      const userData = {
        name,
        email,
        password_hash: hashedPassword,
        role: 'admin',
        status: 'pending',
        id_company: company.id as number,
        created_at: new Date(),
        updated_at: new Date()
      };

      const user = await this.gateway.createUser(userData);
      this.gateway.loggerInfo('Usuário administrador criado com sucesso', {
        id_user: user.id,
        email,
        role: 'admin'
      });
      // 5. Criar a assinatura de teste (trial) de 14 dias
      const inputCreateTrialSubscription: CreateFreeSubscriptionInput = {
        id_company: company.id as number
      };
      await this.interactorCreateTrialSubscription.execute(
        inputCreateTrialSubscription
      );

      // 6. Preparar resposta de sucesso (sem dados sensíveis)
      const response = {
        message: 'Registro realizado com sucesso',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
          },
          company: {
            id: company.id,
            name: company.name
          }
          // subscription: {
          //   id: subscription.id,
          //   status: subscription.status,
          //   trial_end_date: trialEndDate,
          //   plan: planFound.name
          // }
        }
      };

      this.gateway.loggerInfo('Registro concluído com sucesso', {
        id_user: user.id,
        id_company: company.id,
        subscription_id: 1 // subscription.id
      });

      // Gerar token de ativação
      const activationToken = await this.gateway.generateActivationToken(
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
        planName: planFound.name,
        maxUsers: String(planFound.max_users),
        maxPlanners: String(planFound.max_planners),
        maxTeams: String(planFound.max_teams),
        maxObjectives: String(planFound.max_objectives_per_quarter),
        maxKeyResults: String(planFound.max_key_results_per_objective),
        currentYear: String(new Date().getFullYear())
      };
      const emailContent = Utils.loadEmailTemplate(templateName, variables);

      const emailSent = await this.gateway.sendInviteEmail(email, emailContent);

      if (!emailSent) {
        this.gateway.loggerError('Erro ao enviar email de convite', { email });
        // return this.presenter.serverError('Erro ao enviar email de convite');
      }

      this.gateway.loggerInfo('Convite enviado com sucesso', {
        email,
        data: `userId: ${user.id}`
      });

      return this.presenter.created(response);
    } catch (error) {
      this.gateway.loggerError('Erro no processo de registro', { error });
      return this.presenter.serverError(
        'Erro interno no servidor durante o registro'
      );
    }
  }
}
