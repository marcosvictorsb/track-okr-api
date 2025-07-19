import { HttpResponse } from '@protocols/http';
import {
  ConfirmPasswordResetInteractorDependencies,
  InputConfirmPasswordReset,
  IConfirmPasswordResetGateway
} from '../interfaces/confirm-password-reset.interface';
import { IPresenter } from '@protocols/presenter';

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

      // Validar senha
      if (!newPassword || newPassword.length < 6) {
        return this.presenter.badRequest(
          'A senha deve ter pelo menos 6 caracteres'
        );
      }

      // Verificar se o token é válido
      const tokenData = await this.gateway.findValidToken(token);
      if (!tokenData) {
        this.gateway.loggerInfo('Token inválido ou expirado', { token });
        return this.presenter.badRequest('Token inválido ou expirado');
      }

      // Verificar se o usuário existe
      const user = await this.gateway.findUserByEmail(tokenData.email);
      if (!user) {
        this.gateway.loggerError('Usuário não encontrado para o token', {
          email: tokenData.email,
          token
        });
        return this.presenter.badRequest('Usuário não encontrado');
      }

      // Hash da nova senha
      const hashedPassword = this.gateway.hashPassword(newPassword);

      // Atualizar senha do usuário
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

      // Marcar token como usado
      const tokenMarked = await this.gateway.markTokenAsUsed(token);
      if (!tokenMarked) {
        this.gateway.loggerError('Erro ao marcar token como usado', { token });
        // Não retornamos erro aqui pois a senha já foi alterada
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
