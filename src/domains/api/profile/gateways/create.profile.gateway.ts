import { MixCreateProfile } from '@adapters/gateways';
import { ImageProcessingService } from '@adapters/services/image.processing.service';
import { logger } from '@configs/logger';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { IUserRepository } from '@domains/api/users/interfaces';
import { ProfileEntity } from '../entity/profile.entity';
import {
  ICreateProfileGateway,
  ICreateProfileGatewayDependencies
} from '../interfaces/create.profile.interface';
import { IProfileRepository } from '../interfaces/default.interfaces';

export class CreateProfileGateway
  extends MixCreateProfile
  implements ICreateProfileGateway
{
  profileRepository: IProfileRepository;
  userRepository: IUserRepository;
  imageProcessingService: ImageProcessingService;
  logging: typeof logger;

  constructor(params: ICreateProfileGatewayDependencies) {
    super(params);
    this.profileRepository = params.profileRepository;
    this.userRepository = params.userRepository;
    this.imageProcessingService = params.imageProcessingService;
    this.logging = params.logging;
  }

  public async findUser(id: number): Promise<UserEntity | null> {
    this.logging.info('Buscando usuário para verificar se existe', {
      userId: id
    });

    const user = await this.userRepository.find({ id });
    return user || null;
  }

  public async findUserProfile(userId: number): Promise<ProfileEntity | null> {
    this.logging.info('Buscando perfil do usuário', { userId });

    const profile = await this.profileRepository.findByUserId(userId);
    return profile || null;
  }

  public async updateUserName(
    userId: number,
    name: string
  ): Promise<UserEntity | null> {
    this.logging.info('Atualizando nome do usuário', { userId, name });

    const success = await this.userRepository.update({ name }, { id: userId });

    if (!success) {
      this.logging.warn('Falha ao atualizar nome do usuário', { userId });
      return null;
    }

    return await this.findUser(userId);
  }

  public async createOrUpdateProfile(data: {
    id_user: number;
    photo_url?: string;
    position?: string;
  }): Promise<ProfileEntity> {
    this.logging.info('Criando ou atualizando perfil', {
      userId: data.id_user,
      hasPhoto: !!data.photo_url,
      hasPosition: !!data.position
    });

    // Verificar se já existe perfil
    const existingProfile = await this.findUserProfile(data.id_user);

    if (existingProfile) {
      // Atualizar perfil existente - preparar apenas campos não undefined
      const updateData: { photo_url?: string; position?: string } = {};

      if (data.photo_url !== undefined) {
        updateData.photo_url = data.photo_url;
        this.logging.info('Atualizando photo_url do perfil', {
          userId: data.id_user,
          oldPhotoUrl: existingProfile.photo_url,
          newPhotoUrl: data.photo_url
        });
      }

      if (data.position !== undefined) {
        updateData.position = data.position;
        this.logging.info('Atualizando position do perfil', {
          userId: data.id_user,
          oldPosition: existingProfile.position,
          newPosition: data.position
        });
      }

      const success = await this.profileRepository.update(updateData, {
        id_user: data.id_user
      });

      if (!success) {
        this.logging.error('Falha ao atualizar perfil existente', {
          userId: data.id_user,
          updateData
        });
        throw new Error('Falha ao atualizar perfil');
      }

      // Buscar o perfil atualizado com dados do usuário
      const updatedProfile = await this.profileRepository.findByUserId(
        data.id_user
      );
      if (!updatedProfile) {
        throw new Error('Erro ao recuperar perfil atualizado');
      }

      this.logging.info('Perfil atualizado com sucesso', {
        userId: data.id_user,
        profileId: updatedProfile.id,
        photoUrl: updatedProfile.photo_url,
        position: updatedProfile.position
      });

      return updatedProfile;
    } else {
      // Criar novo perfil
      this.logging.info('Criando novo perfil', {
        userId: data.id_user,
        data
      });

      const newProfile = await this.profileRepository.create(data);

      this.logging.info('Novo perfil criado com sucesso', {
        userId: data.id_user,
        profileId: newProfile.id,
        photoUrl: newProfile.photo_url,
        position: newProfile.position
      });

      return newProfile;
    }
  }

  public async processAvatar(
    fileBuffer: Buffer,
    originalName: string,
    userId: number
  ): Promise<string> {
    this.logging.info('Processando avatar', {
      userId,
      originalName,
      fileSize: fileBuffer.length
    });

    return await this.imageProcessingService.processAndSaveAvatar(
      fileBuffer,
      originalName,
      userId
    );
  }

  public async deleteOldAvatar(avatarPath: string): Promise<void> {
    this.logging.info('Deletando avatar antigo', { avatarPath });

    await this.imageProcessingService.deleteAvatar(avatarPath);
  }
}
