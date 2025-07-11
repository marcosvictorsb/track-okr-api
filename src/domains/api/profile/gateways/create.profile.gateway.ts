import {
  ICreateProfileGateway,
  ICreateProfileGatewayDependencies
} from '../interfaces/create.profile.interface';
import { ProfileEntity } from '../entity/profile.entity';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { IProfileRepository } from '../interfaces/default.interfaces';
import { IUserRepository } from '@domains/api/users/interfaces';
import { ImageProcessingService } from '@adapters/services/image.processing.service';
import { logger } from '@configs/logger';

export class CreateProfileGateway implements ICreateProfileGateway {
  private profileRepository: IProfileRepository;
  private userRepository: IUserRepository;
  private imageProcessingService: ImageProcessingService;
  private logging: typeof logger;

  constructor(params: ICreateProfileGatewayDependencies) {
    this.profileRepository = params.profileRepository;
    this.userRepository = params.userRepository;
    this.imageProcessingService = params.imageProcessingService;
    this.logging = params.logging;
  }

  public async findUser(id: number): Promise<UserEntity | null> {
    this.logging.info('Buscando usuário', { userId: id });

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

    const success = await this.userRepository.update({ id: userId }, { name });

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
      // Atualizar perfil existente
      const updateData: { photo_url?: string; position?: string } = {};
      if (data.photo_url !== undefined) updateData.photo_url = data.photo_url;
      if (data.position !== undefined) updateData.position = data.position;

      const success = await this.profileRepository.update(
        { id_user: data.id_user },
        updateData
      );

      if (!success) {
        throw new Error('Falha ao atualizar perfil');
      }

      return (await this.profileRepository.findByUserId(
        data.id_user
      )) as ProfileEntity;
    } else {
      // Criar novo perfil
      return await this.profileRepository.create(data);
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
