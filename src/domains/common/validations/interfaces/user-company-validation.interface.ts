import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  FindUserCriteria,
  IUserRepository
} from '@domains/api/users/interfaces';
import { HttpResponse } from '@protocols/http';

export type InputUserCompanyValidation = {
  id_user: number;
  id_company: number;
};

export type UserCompanyValidationResult = {
  isValid: boolean;
  user?: UserEntity;
  errorResponse?: HttpResponse;
};

export type UserCompanyValidationGatewayDependencies = {
  userRepository: IUserRepository;
  logging: typeof logger;
};

export interface IUserCompanyValidationGateway {
  findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined>;
  loggerInfo(message: string, data?: DataLogOutput): void;
}

export type UserCompanyValidationInteractorDependencies = {
  gateway: IUserCompanyValidationGateway;
};
