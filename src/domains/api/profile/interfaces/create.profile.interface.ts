import { DataLogOutput } from '@adapters/services';
import { ImageProcessingService } from '@adapters/services/image.processing.service';
import { logger } from '@configs/logger';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { IUserRepository } from '@domains/api/users/interfaces';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { Response } from 'express';
import { ProfileEntity } from '../entity/profile.entity';
import { CreateProfileGateway } from '../gateways/create.profile.gateway';
import { IProfileRepository } from './default.interfaces';

export type InputCreateProfile = {
  name: string;
  position?: string;
  file?: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  };
  id_user: number;
  id_company: number;
};

export type CreateProfileInteractorDependencies = {
  gateway: CreateProfileGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export type ICreateProfileGatewayDependencies = {
  profileRepository: IProfileRepository;
  userRepository: IUserRepository;
  imageProcessingService: ImageProcessingService;
  logging: typeof logger;
};

export type CreateProfileControllerDependencies = {
  interactor: ICreateProfileInteractor;
};

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
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface ICreateProfileInteractor {
  execute(input: InputCreateProfile): Promise<HttpResponse>;
}

export interface ICreateProfileController {
  createProfile(request: UserPayload, response: Response): Promise<Response>;
}
