import { ProfileEntity } from '../entity/profile.entity';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { Request, Response } from 'express';
import { IProfileRepository } from './default.interfaces';
import { IUserRepository } from '@domains/api/users/interfaces';
import { ImageProcessingService } from '@adapters/services/image.processing.service';
import { DataLogOutput } from '@adapters/services';

export interface CreateProfileRequest {
  name: string;
  position?: string;
  // file será tratado pelo multer
}

export interface CreateProfileResponse {
  success: boolean;
  data?: {
    profile: ProfileEntity;
    user: UserEntity;
  };
  message?: string;
}

export interface ICreateProfileGatewayDependencies extends DataLogOutput {
  profileRepository: IProfileRepository;
  userRepository: IUserRepository;
  imageProcessingService: ImageProcessingService;
  logging: typeof import('@configs/logger').logger;
}

export interface ICreateProfileGateway {
  findUser(id: number): Promise<UserEntity | null>;
  findUserProfile(userId: number): Promise<ProfileEntity | null>;
  updateUserName(userId: number, name: string): Promise<UserEntity | null>;
  createOrUpdateProfile(data: {
    id_user: number;
    photo_url?: string;
    position?: string;
  }): Promise<ProfileEntity>;
  processAvatar(
    fileBuffer: Buffer,
    originalName: string,
    userId: number
  ): Promise<string>;
  deleteOldAvatar(avatarPath: string): Promise<void>;
}

export interface ICreateProfileInteractor {
  execute(params: {
    name: string;
    position?: string;
    file?: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    };
    userId: number;
  }): Promise<CreateProfileResponse>;
}

export interface ICreateProfileController {
  createProfile(request: Request, response: Response): Promise<void>;
}
