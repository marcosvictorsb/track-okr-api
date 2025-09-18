import { UserStatus } from '@domains/api/users/interfaces';
import { CreateFreeSubscriptionInput } from '@domains/common/subscriptions/interfaces';
import { CreateTrialSubscriptionInteractor } from '@domains/common/subscriptions/usecases/create.trial.subscription.interactor';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { Utils } from '@shared/utils/utils';
import {
  InputRegisterBeta,
  IRegisterBetaGateway,
  RegisterBetaInteractorDependencies
} from '../interfaces/register.beta.interface';

export class RegisterBetaInteractor {
  protected gateway: IRegisterBetaGateway;
  protected presenter: IPresenter;
  protected interactorCreateTrialSubscription: CreateTrialSubscriptionInteractor;

  constructor(params: RegisterBetaInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.interactorCreateTrialSubscription =
      params.interactorCreateTrialSubscription;
  }

  async execute(input: InputRegisterBeta): Promise<HttpResponse> {
    try {
      const { name, email, company_name, website, is_beta_tester } = input;

      this.gateway.loggerInfo('Iniciando processo de registro beta', {
        data: JSON.stringify(input)
      });

      // 1. Verificar se o email já existe
      const existingUser = await this.gateway.findUserByEmail(email);
      if (existingUser) {
        this.gateway.loggerInfo('Email já cadastrado', { email });
        return this.presenter.badRequest('Email já está em uso');
      }

      // 2. Verificar se o plano existe
      const planFound = await this.gateway.findPlanByName({
        name: 'Plano Beta'
      });
      if (!planFound) {
        this.gateway.loggerInfo('Plano não encontrado', { name: 'Plano Beta' });
        return this.presenter.badRequest('Plano não encontrado');
      }

      this.gateway.loggerInfo('Plano encontrado', {
        plan_id: planFound.id,
        plan_name: planFound.name
      });

      // 3. Criar a empresa com website se fornecido
      const companyData = {
        name: company_name,
        cnpj: `${email} / ${new Date()}`,
        website: website || undefined,
        created_at: new Date(),
        updated_at: new Date()
      };

      const company = await this.gateway.createCompany(companyData);
      this.gateway.loggerInfo('Empresa criada com sucesso', {
        id_company: company.id,
        company_name
      });

      // 4. Criar o usuário administrador sem senha (beta tester)
      const userData = {
        name,
        email,
        password_hash: '',
        role: 'admin',
        status: UserStatus.PENDING_ACTIVATION,
        id_company: company.id as number
      };

      const user = await this.gateway.createUser(userData);
      this.gateway.loggerInfo('Usuário beta criado com sucesso', {
        id_user: user.id,
        email,
        role: 'admin'
      });

      // 5. Criar a assinatura beta (3 meses)
      const inputCreateBetaSubscription: CreateFreeSubscriptionInput = {
        id_company: company.id as number,
        isBeta: true,
        name: 'Plano Beta'
      };

      // Usando CreateTrialSubscriptionInteractor com isBeta=true para 3 meses
      await this.interactorCreateTrialSubscription.execute(
        inputCreateBetaSubscription
      );

      // 6. Preparar resposta de sucesso
      const response = {
        message: 'Registro beta realizado com sucesso',
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
            name: company.name,
            website: company.website
          }
        }
      };

      this.gateway.loggerInfo('Registro beta concluído com sucesso', {
        id_user: user.id,
        id_company: company.id
      });

      // 7. Gerar token de ativação
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
        companyName: company.name,
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
        currentYear: String(new Date().getFullYear()),
        betaDuration: '3 meses',
        website: website || 'Não informado'
      };

      const emailContent = Utils.loadEmailTemplate(templateName, variables);

      const emailSent = await this.gateway.sendInviteEmail(email, emailContent);

      if (!emailSent) {
        this.gateway.loggerError('Erro ao enviar email beta', { email });
      }

      this.gateway.loggerInfo('Email beta enviado com sucesso', {
        email,
        data: `userId: ${user.id}`
      });

      return this.presenter.created(response);
    } catch (error) {
      this.gateway.loggerError('Erro no processo de registro beta', {
        error: (error as Error).message,
        stack: (error as Error).stack
      });
      return this.presenter.serverError(
        'Erro interno no servidor durante o registro beta'
      );
    }
  }
}
