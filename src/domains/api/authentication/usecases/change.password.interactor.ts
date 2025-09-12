import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  ChangePasswordInteractorDependencies,
  IChangePasswordGateway,
  InputChangePassword
} from '../interfaces';

export class ChangePasswordInteractor {
  protected gateway: IChangePasswordGateway;
  protected presenter: IPresenter;

  constructor(params: ChangePasswordInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  async execute(input: InputChangePassword): Promise<HttpResponse> {
    try {
      const { token, password } = input;

      this.gateway.loggerInfo('Iniciando processo de reset de senha');

      const findTokenReset = await this.gateway.findToken(token);
      if (!findTokenReset) {
        this.gateway.loggerInfo('Usuário não encontrado para reset de senha');
        return this.presenter.notFound('Token inválido ou expirado');
      }

      if (
        new Date() > new Date(findTokenReset.expires_at) ||
        findTokenReset.used
      ) {
        this.gateway.loggerInfo('Token expirado', {
          token,
          expires_at_token: findTokenReset.expires_at
        });
        return this.presenter.badRequest('Token expirado');
      }

      const user = await this.gateway.findUser({ email: findTokenReset.email });
      if (!user) {
        this.gateway.loggerError('Usuário não encontrado para o token', {
          email: findTokenReset.email,
          token
        });
        return this.presenter.badRequest('Usuário não encontrado');
      }

      // Hash da nova senha
      const hashedPassword = this.gateway.hashPassword(password);

      // Atualizar senha do usuário
      await this.gateway.updateUser(
        { password_hash: hashedPassword },
        { id: user.id }
      );

      // Marcar token como usado
      const tokenMarked = await this.gateway.markTokenAsUsed(token);
      if (!tokenMarked) {
        this.gateway.loggerError('Erro ao marcar token como usado', { token });
      }

      return this.presenter.ok('Senha alterada com sucesso');
    } catch (error) {
      this.gateway.loggerError('Erro interno para trocar senha', { error });
      return this.presenter.serverError(error);
    }
  }
}
