import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  GetProfileInteractorDependencies,
  IGetProfileGateway,
  IGetProfileInteractor,
  InputGetProfile
} from '../interfaces/get.profile.interface';

export class GetProfileInteractor implements IGetProfileInteractor {
  protected gateway: IGetProfileGateway;
  protected presenter: IPresenter;

  constructor(params: GetProfileInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  public async execute(input: InputGetProfile): Promise<HttpResponse> {
    try {
      const { id_user, id_company } = input;

      this.gateway.loggerInfo('Iniciando busca do perfil do usuário', {
        id_user,
        id_company
      });

      const user = await this.gateway.findUser(id_user);
      if (!user) {
        this.gateway.loggerInfo('Usuário não encontrado', { id_user });
        return this.presenter.notFound('Usuário não encontrado');
      }

      if (user.id_company !== id_company) {
        this.gateway.loggerInfo('Usuário não pertence à empresa informada', {
          id_user,
          id_company
        });
        return this.presenter.forbidden(
          'Usuário não pertence à empresa informada'
        );
      }

      const profile = await this.gateway.findUserProfile(id_user);

      const profileResponse = {
        name: user.name,
        email: user.email,
        position: profile?.position || null,
        avatar: profile?.photo_url || null
      };

      this.gateway.loggerInfo('Perfil do usuário encontrado com sucesso', {
        id_user
      });

      return this.presenter.ok(profileResponse);
    } catch (error) {
      this.gateway.loggerError('Erro ao buscar perfil do usuário', {
        id_user: input.id_user,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return this.presenter.serverError('Erro ao buscar perfil do usuário');
    }
  }
}
