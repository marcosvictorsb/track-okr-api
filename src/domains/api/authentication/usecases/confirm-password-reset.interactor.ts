import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  ConfirmPasswordResetInteractorDependencies,
  IConfirmPasswordResetGateway,
  InputConfirmPasswordReset
} from '../interfaces/confirm-password-reset.interface';

export class ConfirmPasswordResetInteractor {
  protected gateway: IConfirmPasswordResetGateway;
  protected presenter: IPresenter;

  constructor(params: ConfirmPasswordResetInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  async execute(input: InputConfirmPasswordReset): Promise<HttpResponse> {
    try {
      const { token, newPassword } = input;

      this.gateway.loggerInfo('Iniciando confirmação de reset de senha', {
        token
      });

      if (!newPassword || newPassword.length < 6) {
        return this.presenter.badRequest(
          'A senha deve ter pelo menos 6 caracteres'
        );
      }

      const tokenData = await this.gateway.findValidToken(token);
      if (!tokenData) {
        this.gateway.loggerInfo('Token inválido ou expirado', { token });
        return this.presenter.badRequest('Token inválido ou expirado');
      }

      const user = await this.gateway.findUserByEmail(tokenData.email);
      if (!user) {
        this.gateway.loggerError('Usuário não encontrado para o token', {
          email: tokenData.email,
          token
        });
        return this.presenter.badRequest('Usuário não encontrado');
      }

      const hashedPassword = this.gateway.hashPassword(newPassword);

      const passwordUpdated = await this.gateway.updateUserPassword(
        tokenData.email,
        hashedPassword
      );

      if (!passwordUpdated) {
        this.gateway.loggerError('Erro ao atualizar senha do usuário', {
          email: tokenData.email
        });
        return this.presenter.serverError('Erro ao atualizar senha');
      }

      const tokenMarked = await this.gateway.markTokenAsUsed(token);
      if (!tokenMarked) {
        this.gateway.loggerError('Erro ao marcar token como usado', { token });
      }

      this.gateway.loggerInfo('Senha alterada com sucesso', {
        email: tokenData.email,
        token
      });

      return this.presenter.ok({
        message:
          'Senha alterada com sucesso. Você já pode fazer login com sua nova senha.'
      });
    } catch (error) {
      this.gateway.loggerError(
        'Erro no processo de confirmação de reset de senha',
        {
          error: String(error)
        }
      );
      return this.presenter.serverError(error);
    }
  }
}
