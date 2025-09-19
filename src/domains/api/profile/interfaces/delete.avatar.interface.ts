import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { Response } from 'express';
import { IProfileRepository } from './default.interfaces';

export interface InputDeleteAvatar {
  id_user: number;
  id_company: number;
}

export interface IDeleteAvatarGateway {
  findUserProfile(
    userId: number
  ): Promise<{ photo_url?: string | null } | null>;
  removeAvatarFromProfile(userId: number): Promise<boolean>;
  deleteAvatarFile(avatarPath: string): Promise<void>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
  loggerWarn(message: string, data?: DataLogOutput): void;
}

export interface IDeleteAvatarInteractor {
  execute(input: InputDeleteAvatar): Promise<HttpResponse>;
}

export interface IDeleteAvatarController {
  deleteAvatar(request: UserPayload, response: Response): Promise<Response>;
}

export type DeleteAvatarControllerDependencies = {
  interactor: IDeleteAvatarInteractor;
};

export type DeleteAvatarInteractorDependencies = {
  gateway: IDeleteAvatarGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export type DeleteAvatarGatewayDependencies = {
  profileRepository: IProfileRepository;
  imageProcessingService: import('@adapters/services/image.processing.service').ImageProcessingService;
  logging: typeof logger;
};
