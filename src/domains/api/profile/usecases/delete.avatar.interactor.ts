import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  DeleteAvatarInteractorDependencies,
  IDeleteAvatarGateway,
  IDeleteAvatarInteractor,
  InputDeleteAvatar
} from '../interfaces/delete.avatar.interface';

export class DeleteAvatarInteractor implements IDeleteAvatarInteractor {
  private gateway: IDeleteAvatarGateway;
  private presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: DeleteAvatarInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  public async execute(input: InputDeleteAvatar): Promise<HttpResponse> {
    const { id_user, id_company } = input;

    try {
      this.gateway.loggerInfo('Iniciando processo de delete de avatar', {
        id_user,
        requestTxt: 'Usuário solicitou remoção do avatar'
      });

      // Validar usuário e empresa
      const validation = await this.userCompanyValidator.execute({
        id_user,
        id_company
      });

      if (!validation.isValid) {
        this.gateway.loggerInfo('Validação de usuário e empresa falhou', {
          id_user,
          id_company,
          requestTxt: `Usuário ${id_user} não pertence à empresa ${id_company} ou dados inválidos`
        });
        return this.presenter.badRequest('Usuário ou empresa inválidos');
      }

      const profile = await this.gateway.findUserProfile(id_user);

      if (!profile) {
        this.gateway.loggerInfo('Perfil não encontrado para delete de avatar', {
          id_user,
          requestTxt: 'Usuário não possui perfil cadastrado'
        });
        return this.presenter.notFound('Perfil não encontrado');
      }

      // Verificar se existe avatar para deletar
      if (!profile.photo_url || profile.photo_url.trim() === '') {
        this.gateway.loggerInfo('Usuário não possui avatar para deletar', {
          id_user,
          requestTxt: 'Campo photo_url está vazio ou nulo'
        });
        return this.presenter.badRequest(
          'Usuário não possui avatar para deletar'
        );
      }

      const avatarPath = profile.photo_url;

      // Remover photo_url do banco de dados
      const databaseUpdateSuccess =
        await this.gateway.removeAvatarFromProfile(id_user);

      if (!databaseUpdateSuccess) {
        this.gateway.loggerError('Falha ao remover avatar do banco de dados', {
          id_user,
          data: avatarPath,
          requestTxt: 'Operação de update no banco falhou'
        });
        return this.presenter.serverError('Erro ao remover avatar do perfil');
      }

      // Tentar deletar arquivo físico
      try {
        await this.gateway.deleteAvatarFile(avatarPath);
        this.gateway.loggerInfo(
          'Avatar deletado com sucesso (banco e arquivo)',
          {
            id_user,
            data: avatarPath,
            requestTxt: 'Avatar removido do banco e arquivo físico deletado'
          }
        );
      } catch (fileError) {
        // Log do erro mas não falha a operação (arquivo pode não existir)
        this.gateway.loggerWarn(
          'Erro ao deletar arquivo físico do avatar (operação continua)',
          {
            id_user,
            data: avatarPath,
            error:
              fileError instanceof Error
                ? fileError.message
                : 'Erro desconhecido',
            requestTxt:
              'photo_url foi removida do banco, mas arquivo físico não foi encontrado ou não pôde ser deletado'
          }
        );
      }

      return this.presenter.ok({
        message: 'Avatar removido com sucesso',
        avatar_removed: true
      });
    } catch (error) {
      this.gateway.loggerError('Erro inesperado ao deletar avatar', {
        id_user,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      });

      return this.presenter.serverError('Erro interno do servidor');
    }
  }
}
