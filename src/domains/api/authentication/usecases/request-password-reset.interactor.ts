import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  InputRequestPasswordReset,
  IRequestPasswordResetGateway,
  RequestPasswordResetInteractorDependencies
} from '../interfaces/request-password-reset.interface';

export class RequestPasswordResetInteractor {
  protected gateway: IRequestPasswordResetGateway;
  protected presenter: IPresenter;

  constructor(params: RequestPasswordResetInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  async execute(input: InputRequestPasswordReset): Promise<HttpResponse> {
    try {
      const { email } = input;

      this.gateway.loggerInfo('Iniciando processo de reset de senha', {
        email
      });

      const user = await this.gateway.findUserByEmail(email);
      if (!user) {
        this.gateway.loggerInfo('Usuário não encontrado para reset de senha', {
          email
        });
        return this.presenter.ok({
          message:
            'Se o email existir em nossa base de dados, você receberá as instruções para redefinir sua senha.'
        });
      }
      await this.gateway.deleteExistingTokens(email);

      const resetToken = this.gateway.generateResetToken();

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const tokenSaved = await this.gateway.saveResetToken(
        email,
        resetToken,
        expiresAt
      );
      if (!tokenSaved) {
        this.gateway.loggerError('Erro ao salvar token de reset', { email });
        return this.presenter.serverError('Erro interno do servidor');
      }

      const isProduction = process.env.NODE_ENV === 'production';
      const baseUrl = isProduction
        ? process.env.PRODUCTION_BASE_URL
        : process.env.DEVELOPMENT_BASE_URL;
      const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}`;

      const expiryDate = expiresAt.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
      });

      const emailSent = await this.gateway.sendPasswordResetEmail(
        email,
        resetLink,
        user.name,
        expiryDate
      );

      if (!emailSent) {
        this.gateway.loggerError('Erro ao enviar email de reset', { email });
        return this.presenter.serverError('Erro ao enviar email');
      }

      this.gateway.loggerInfo('Reset de senha solicitado com sucesso', {
        email
      });

      return this.presenter.ok({
        message:
          'Se o email existir em nossa base de dados, você receberá as instruções para redefinir sua senha.'
      });
    } catch (error) {
      this.gateway.loggerError('Erro no processo de reset de senha', { error });
      return this.presenter.serverError(error);
    }
  }
}
