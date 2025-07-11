import {
  ICreateProfileInteractor,
  ICreateProfileGateway,
  CreateProfileResponse
} from '../interfaces/create.profile.interface';
import { logger } from '@configs/logger';

export class CreateProfileInteractor implements ICreateProfileInteractor {
  private gateway: ICreateProfileGateway;
  private logging: typeof logger;

  constructor(gateway: ICreateProfileGateway) {
    this.gateway = gateway;
    this.logging = logger;
  }

  public async execute(params: {
    name: string;
    position?: string;
    file?: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    };
    userId: number;
  }): Promise<CreateProfileResponse> {
    try {
      this.logging.info('Iniciando criação/atualização de perfil', {
        userId: params.userId,
        hasFile: !!params.file,
        hasPosition: !!params.position
      });

      // Validar dados obrigatórios
      if (!params.name || params.name.trim().length === 0) {
        return {
          success: false,
          message: 'Nome é obrigatório'
        };
      }

      if (params.name.trim().length < 2) {
        return {
          success: false,
          message: 'Nome deve ter pelo menos 2 caracteres'
        };
      }

      // Verificar se usuário existe
      const user = await this.gateway.findUser(params.userId);
      if (!user) {
        return {
          success: false,
          message: 'Usuário não encontrado'
        };
      }

      // Verificar se há perfil existente para deletar avatar antigo
      const existingProfile = await this.gateway.findUserProfile(params.userId);
      let oldAvatarPath: string | null = null;

      if (existingProfile && existingProfile.photo_url && params.file) {
        oldAvatarPath = existingProfile.photo_url;
      }

      // Processar avatar se fornecido
      let avatarPath: string | undefined;
      if (params.file) {
        // Validar arquivo
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (params.file.size > maxSize) {
          return {
            success: false,
            message: 'Arquivo muito grande. Máximo permitido: 5MB'
          };
        }

        const allowedMimeTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp'
        ];
        if (!allowedMimeTypes.includes(params.file.mimetype)) {
          return {
            success: false,
            message: 'Formato de arquivo não suportado. Use JPG, PNG ou WebP'
          };
        }

        try {
          avatarPath = await this.gateway.processAvatar(
            params.file.buffer,
            params.file.originalname,
            params.userId
          );
        } catch (error) {
          this.logging.error('Erro ao processar avatar', {
            userId: params.userId,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });

          return {
            success: false,
            message: `Erro ao processar imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          };
        }
      }

      // Atualizar nome do usuário
      const updatedUser = await this.gateway.updateUserName(
        params.userId,
        params.name.trim()
      );
      if (!updatedUser) {
        return {
          success: false,
          message: 'Erro ao atualizar nome do usuário'
        };
      }

      // Criar ou atualizar perfil
      const profileData: {
        id_user: number;
        photo_url?: string;
        position?: string;
      } = {
        id_user: params.userId
      };

      if (avatarPath !== undefined) {
        profileData.photo_url = avatarPath;
      }

      if (params.position !== undefined) {
        profileData.position = params.position.trim() || undefined;
      }

      const profile = await this.gateway.createOrUpdateProfile(profileData);

      // Deletar avatar antigo se um novo foi carregado
      if (oldAvatarPath && avatarPath) {
        try {
          await this.gateway.deleteOldAvatar(oldAvatarPath);
        } catch (error) {
          // Log mas não falha a operação
          this.logging.warn('Erro ao deletar avatar antigo', {
            userId: params.userId,
            oldAvatarPath,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      }

      this.logging.info('Perfil criado/atualizado com sucesso', {
        userId: params.userId,
        profileId: profile.id
      });

      return {
        success: true,
        data: {
          profile,
          user: updatedUser
        },
        message: 'Perfil atualizado com sucesso'
      };
    } catch (error) {
      this.logging.error('Erro ao criar/atualizar perfil', {
        userId: params.userId,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      });

      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }
}
