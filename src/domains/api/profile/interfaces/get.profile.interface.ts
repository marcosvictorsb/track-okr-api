import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { IUserRepository } from '@domains/api/users/interfaces';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { Response } from 'express';
import { ProfileEntity } from '../entity/profile.entity';
import { IProfileRepository } from './default.interfaces';

export type InputGetProfile = {
  id_company: number;
  id_user: number;
};

export type GetProfileInteractorDependencies = {
  gateway: IGetProfileGateway;
  presenter: IPresenter;
};

export type IGetProfileGatewayDependencies = {
  profileRepository: IProfileRepository;
  userRepository: IUserRepository;
  logging: typeof logger;
};

export type GetProfileControllerDependencies = {
  interactor: IGetProfileInteractor;
};

export interface IGetProfileGateway {
  findUser(id: number): Promise<UserEntity | null>;
  findUserProfile(userId: number): Promise<ProfileEntity | null>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IGetProfileInteractor {
  execute(input: InputGetProfile): Promise<HttpResponse>;
}

export interface IGetProfileController {
  getProfile(request: UserPayload, response: Response): Promise<Response>;
}
