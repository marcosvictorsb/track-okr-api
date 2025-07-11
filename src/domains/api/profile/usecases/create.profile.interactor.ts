import { HttpResponse } from '@protocols/http';
import {
  ICreateProfileInteractor,
  InputCreateProfile,
  CreateProfileInteractorDependencies
} from '../interfaces/create.profile.interface';
import { IPresenter } from '@protocols/presenter';
import { CreateProfileGateway } from '../gateways/create.profile.gateway';

export class CreateProfileInteractor implements ICreateProfileInteractor {
  protected gateway: CreateProfileGateway;
  protected presenter: IPresenter;

  constructor(params: CreateProfileInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  public async execute(input: InputCreateProfile): Promise<HttpResponse> {
    try {
      const { name, position, file, id_user } = input;

      this.gateway.loggerInfo('Iniciando criação/atualização de perfil', {
        id_user
      });

      // Validar dados obrigatórios
      if (!name || name.trim().length === 0) {
        return this.presenter.badRequest('Nome é obrigatório');
      }

      if (name.trim().length < 2) {
        return this.presenter.badRequest(
          'Nome deve ter pelo menos 2 caracteres'
        );
      }

      // Verificar se usuário existe
      const user = await this.gateway.findUser(id_user);
      if (!user) {
        return this.presenter.notFound('Usuário não encontrado');
      }

      // Verificar se há perfil existente para deletar avatar antigo
      const existingProfile = await this.gateway.findUserProfile(id_user);
      let oldAvatarPath: string | null = null;

      if (existingProfile && existingProfile.photo_url && file) {
        oldAvatarPath = existingProfile.photo_url;
      }

      // Processar avatar se fornecido
      let avatarPath: string | undefined;
      if (file) {
        // Validar arquivo
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          return this.presenter.badRequest(
            'Arquivo muito grande. Máximo permitido: 5MB'
          );
        }

        const allowedMimeTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp'
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return this.presenter.badRequest(
            'Formato de arquivo não suportado. Use JPG, PNG ou WebP'
          );
        }

        try {
          avatarPath = await this.gateway.processAvatar(
            file.buffer,
            file.originalname,
            id_user
          );
        } catch (error) {
          this.gateway.loggerError('Erro ao processar avatar', {
            id_user,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });

          return this.presenter.badRequest(
            `Erro ao processar imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          );
        }
      }

      // Atualizar nome do usuário
      const updatedUser = await this.gateway.updateUserName(
        id_user,
        name.trim()
      );
      if (!updatedUser) {
        return this.presenter.badRequest('Erro ao atualizar nome do usuário');
      }

      // Criar ou atualizar perfil
      const profileData: {
        id_user: number;
        photo_url?: string;
        position?: string;
      } = {
        id_user
      };

      if (avatarPath !== undefined) {
        profileData.photo_url = avatarPath;
      }

      if (position !== undefined) {
        profileData.position = position.trim() || undefined;
      }

      const profile = await this.gateway.createOrUpdateProfile(profileData);

      // Deletar avatar antigo se um novo foi carregado
      if (oldAvatarPath && avatarPath) {
        try {
          await this.gateway.deleteOldAvatar(oldAvatarPath);
        } catch (error) {
          // Log mas não falha a operação
          this.gateway.loggerInfo('Erro ao deletar avatar antigo', {
            id_user,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      }

      this.gateway.loggerInfo('Perfil criado/atualizado com sucesso', {
        id_user
      });

      return this.presenter.ok({
        profile,
        user: updatedUser,
        message: 'Perfil atualizado com sucesso'
      });
    } catch (error) {
      this.gateway.loggerError('Erro ao criar/atualizar perfil', {
        id_user: input.id_user,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return this.presenter.serverError('Erro ao criar/atualizar perfil');
    }
  }
}
