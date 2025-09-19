import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { IAuthenticationGateway, InputAuthentication } from '../interfaces';

export class AuthenticationInteractor {
  protected gateway: IAuthenticationGateway;
  protected presenter: IPresenter;

  constructor(gateway: IAuthenticationGateway, presenter: IPresenter) {
    this.gateway = gateway;
    this.presenter = presenter;
  }

  async execute(input: InputAuthentication): Promise<HttpResponse> {
    try {
      const { email, password, rememberMe } = input;
      this.gateway.loggerInfo(
        `Iniciando a busca pelo usuário com o email: ${email}`
      );

      const user = await this.gateway.findUser({ email });
      if (!user) {
        this.gateway.loggerInfo(
          `Não encontrado usuário com esse email: ${email}`
        );
        return this.presenter.conflict('Email ou senha está incorreto');
      }

      if (!user.password_hash) {
        this.gateway.loggerInfo('Senha do usuário não encontrada');
        return this.presenter.conflict('Email ou senha está incorreto');
      }

      const isCorretPassword = this.isCorretPassword(
        password,
        user.password_hash
      );
      if (!isCorretPassword) {
        this.gateway.loggerInfo('Email está incorreto');
        return this.presenter.conflict('Email ou senha está incorreto');
      }

      const credential = this.gateway.signToken({
        name: user.name,
        email: user.email,
        id: user.id,
        id_company: user.id_company,
        rememberMe: rememberMe || false
      });

      const profile = await this.gateway.getProfile(user.id as number);

      const userTeam = await this.gateway.getUserTeam(user.id as number);

      return this.presenter.ok({
        id: user.id,
        name: user.name,
        email: user.email,
        token: credential,
        role: user.role,
        avatar: profile?.photo_url || '',
        id_team: userTeam?.id_team || undefined
      });
    } catch (error) {
      this.gateway.loggerError('Error ao buscar o token', error);
      return this.presenter.serverError(error);
    }
  }

  private isCorretPassword(password: string, userPassword: string): boolean {
    return this.gateway.comparePasswords(password, userPassword) || false;
  }
}
