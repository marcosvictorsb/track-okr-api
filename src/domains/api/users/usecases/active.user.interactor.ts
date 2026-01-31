import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { ActiveUserGateway } from '../gateways/active.user.gateway';
import { UpdateUserCriteria, UserStatus } from '../interfaces';
import {
  ActiveUserInteractorDependencies,
  InputActiveUser
} from '../interfaces/active.user.interface';

export class ActiveUserInteractor {
  protected gateway: ActiveUserGateway;
  protected presenter: IPresenter;

  constructor(params: ActiveUserInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  async execute(input: InputActiveUser): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Starting user activation process', {
        requestTxt: JSON.stringify({ idUser: input.idUser })
      });
      const { idUser, password } = input;

      const user = await this.gateway.findUser({ id: idUser });

      if (!user) {
        this.gateway.loggerError('User not found', {
          requestTxt: JSON.stringify({ idUser })
        });
        return this.presenter.notFound('User not found');
      }

      if (user.status === UserStatus.ACTIVE) {
        this.gateway.loggerInfo('Usuário já está ativado', {
          requestTxt: JSON.stringify({ idUser })
        });
        return this.presenter.ok(user);
      }

      const data: UpdateUserCriteria = {
        status: UserStatus.ACTIVE,
        password_hash: this.gateway.encryptPassword(password)
      };
      const updatedUser = await this.gateway.activateUser(data, {
        id: user.id
      });
      if (!updatedUser) {
        this.gateway.loggerError('Falha para ativar o usuário', {
          requestTxt: JSON.stringify({ idUser })
        });
        return this.presenter.badRequest('Failed to activate user');
      }

      const tokenPayload = {
        id: user.id,
        id_company: user.id_company,
        email: user.email,
        role: user.role
      };

      const token = this.gateway.signToken(tokenPayload);

      this.gateway.loggerInfo('Usuário ativado com sucesso e token gerado', {
        requestTxt: JSON.stringify({ idUser, id_company: user.id_company })
      });

      return this.presenter.ok({
        token,
        name: user.name,
        email: user.email
      });
    } catch (error) {
      this.gateway.loggerError('Erro ao ativar o usuário', { error });
      return this.presenter.serverError('Error no servidor');
    }
  }
}
