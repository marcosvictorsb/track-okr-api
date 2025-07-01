import { HttpResponse } from '@protocols/http';
import {
  InviteUserInteractorDependencies,
  InputInviteUser,
  IInviteUserGateway
} from '../interfaces';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserStatus } from '../interfaces/default.interfaces';
import crypto from 'crypto';
import { Utils } from '@shared/utils/utils';

export class InviteUserInteractor {
  protected gateway: IInviteUserGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: InviteUserInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  async execute(input: InputInviteUser): Promise<HttpResponse> {
    try {
      const { email, name, role, teamId, id_company, id_user } = input;

      this.gateway.loggerInfo('Iniciando convite de usuário', {
        data: JSON.stringify({ email, name, role, teamId, id_company })
      });

      // Validar usuário e empresa
      const validation = await this.userCompanyValidator.execute({
        id_user,
        id_company
      });

      if (!validation.isValid) {
        this.gateway.loggerError('O usuário ou empresa não é válido', {
          id_company,
          id_user
        });
        return this.presenter.badRequest('O usuário ou empresa não é válido');
      }

      // Verificar se o usuário já existe
      const existingUser = await this.gateway.findUser({ email, id_company });
      if (existingUser) {
        this.gateway.loggerInfo('Usuário já existe', { email });
        return this.presenter.badRequest(
          'Usuário já cadastrado com este email'
        );
      }

      // Gerar senha temporária
      const tempPassword = crypto.randomBytes(12).toString('hex');

      const userData = {
        name: name || 'Usuário Convidado',
        email,
        password_hash: tempPassword,
        role: role || 'user',
        status: UserStatus.PENDING_ACTIVATION,
        id_company,
        created_at: new Date()
      };

      const newUser = await this.gateway.createUser(userData);

      // Se teamId foi fornecido, incrementar a contagem de usuários do time
      if (teamId) {
        const teamUpdated = await this.gateway.updateTeamUserCount(
          teamId,
          true
        );
        if (!teamUpdated) {
          this.gateway.loggerError('Erro ao atualizar contagem do time', {
            data: `teamId: ${teamId}`
          });
          // Não falhar o convite por causa disso, apenas logar
        }
      }

      // Gerar token de ativação
      const activationToken = await this.gateway.generateActivationToken(
        newUser.id!
      );

      const templateName = 'convite-user.template.html';
      const token = this.gateway.signToken({
        email: newUser.email as string,
        id: newUser.id as number,
        id_company: newUser.id_company as number
      });
      const variables = {
        userName: newUser.name,
        baseUrl:
          process.env.NODE_ENV === 'production'
            ? (process.env.PRODUCTION_BASE_URL as string)
            : (process.env.DEVELOPMENT_BASE_URL as string),
        token
      };
      const emailContent = Utils.loadEmailTemplate(templateName, variables);

      const emailSent = await this.gateway.sendInviteEmail(email, emailContent);

      if (!emailSent) {
        this.gateway.loggerError('Erro ao enviar email de convite', { email });
        return this.presenter.serverError('Erro ao enviar email de convite');
      }

      this.gateway.loggerInfo('Convite enviado com sucesso', {
        email,
        data: `userId: ${newUser.id}, teamId: ${teamId}`
      });

      // Retornar resposta sem dados sensíveis
      return this.presenter.created({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        message:
          'Convite enviado com sucesso. O usuário receberá um email para ativar a conta.'
      });
    } catch (error) {
      this.gateway.loggerError('Erro ao processar convite de usuário', {
        error: String(error)
      });
      return this.presenter.serverError('Erro interno do servidor');
    }
  }
}
