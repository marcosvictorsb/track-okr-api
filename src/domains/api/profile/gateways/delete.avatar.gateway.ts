import { MixDeleteAvatarProfile } from '@adapters/gateways/api/profile/delete.avatar.profile';
import { ImageProcessingService } from '@adapters/services/image.processing.service';
import { logger } from '@configs/logger';
import { IProfileRepository } from '../interfaces/default.interfaces';
import {
  DeleteAvatarGatewayDependencies,
  IDeleteAvatarGateway
} from '../interfaces/delete.avatar.interface';

export class DeleteAvatarGateway
  extends MixDeleteAvatarProfile
  implements IDeleteAvatarGateway
{
  private profileRepository: IProfileRepository;
  private imageProcessingService: ImageProcessingService;
  public logging: typeof logger;

  constructor(params: DeleteAvatarGatewayDependencies) {
    super(params);
    this.profileRepository = params.profileRepository;
    this.imageProcessingService =
      params.imageProcessingService as ImageProcessingService;
    this.logging = params.logging;
  }

  public async findUserProfile(
    userId: number
  ): Promise<{ photo_url?: string | null } | null> {
    this.logging.info('Buscando perfil do usuário para deletar avatar', {
      userId
    });

    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      this.logging.info('Perfil não encontrado', { userId });
      return null;
    }

    return {
      photo_url: profile.photo_url
    };
  }

  public async removeAvatarFromProfile(userId: number): Promise<boolean> {
    this.logging.info('Removendo photo_url do perfil no banco de dados', {
      userId
    });

    const success = await this.profileRepository.update(
      { photo_url: null },
      { id_user: userId }
    );

    if (success) {
      this.logging.info('photo_url removida do banco com sucesso', { userId });
    } else {
      this.logging.error('Falha ao remover photo_url do banco', { userId });
    }

    return success;
  }

  public async deleteAvatarFile(avatarPath: string): Promise<void> {
    this.logging.info('Deletando arquivo de avatar do sistema de arquivos', {
      avatarPath
    });

    try {
      await this.imageProcessingService.deleteAvatar(avatarPath);
      this.logging.info('Arquivo de avatar deletado com sucesso', {
        avatarPath
      });
    } catch (error) {
      this.logging.error('Erro ao deletar arquivo de avatar', {
        avatarPath,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    }
  }
}
