import { HttpResponse } from '@protocols/http';
import {
  RequestPasswordResetInteractorDependencies,
  InputRequestPasswordReset,
  IRequestPasswordResetGateway
} from '../interfaces/request-password-reset.interface';
import { IPresenter } from '@protocols/presenter';

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

      // Verificar se o usuário existe
      const user = await this.gateway.findUserByEmail(email);
      if (!user) {
        this.gateway.loggerInfo('Usuário não encontrado para reset de senha', {
          email
        });
        // Por segurança, sempre retornamos sucesso mesmo se o email não existir
        // para não revelar se um email está cadastrado no sistema
        return this.presenter.ok({
          message:
            'Se o email existir em nossa base de dados, você receberá as instruções para redefinir sua senha.'
        });
      }

      // Remover tokens existentes para este email
      await this.gateway.deleteExistingTokens(email);

      // Gerar novo token
      const resetToken = this.gateway.generateResetToken();

      // Definir expiração em 24 horas
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Salvar token no banco
      const tokenSaved = await this.gateway.saveResetToken(
        email,
        resetToken,
        expiresAt
      );
      if (!tokenSaved) {
        this.gateway.loggerError('Erro ao salvar token de reset', { email });
        return this.presenter.serverError('Erro interno do servidor');
      }

      // Criar link de reset
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

      // Formatar data de expiração para exibição
      const expiryDate = expiresAt.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
      });

      // Enviar email
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
