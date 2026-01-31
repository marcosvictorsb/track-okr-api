import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  CheckUserActiveInteractorDependencies,
  ICheckUserActiveGateway,
  InputCheckUserActive,
  OutputCheckUserActive
} from '../interfaces';

export class CheckUserActiveInteractor {
  protected gateway: ICheckUserActiveGateway;
  protected presenter: IPresenter;

  constructor(params: CheckUserActiveInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  async execute(input: InputCheckUserActive): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Verificando se usuário está ativo', {
        id_user: input.id_user,
        id_company: input.id_company
      });

      const { id_user, id_company } = input;

      const user = await this.gateway.findUser({ id: id_user });

      if (!user) {
        this.gateway.loggerInfo('Usuário não encontrado', {
          id_user: id_user
        });

        const output: OutputCheckUserActive = {
          userActive: false
        };

        return this.presenter.ok(output);
      }

      if (user.id_company !== id_company) {
        this.gateway.loggerInfo('Usuário não pertence à empresa informada', {
          id_user: id_user,
          id_company: id_company,
          id_user_company: user.id_company
        });

        return this.presenter.forbidden(
          'Usuário não pertence à empresa informada'
        );
      }

      const isActive = user.status === 'active';

      this.gateway.loggerInfo('Status do usuário verificado', {
        id_user: id_user,
        user_status: user.status,
        userActive: isActive
      });

      const output: OutputCheckUserActive = {
        userActive: isActive,
        user: user
      };

      return this.presenter.ok(output);
    } catch (error: unknown) {
      this.gateway.loggerError('Erro ao verificar status do usuário', {
        error: (error as Error).message,
        id_user: input.id_user,
        id_company: input.id_company
      });

      return this.presenter.serverError('Erro interno do servidor');
    }
  }
}
