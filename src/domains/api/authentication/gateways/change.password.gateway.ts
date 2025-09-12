import { MixRegisterPasswordResetGateway } from '@adapters/gateways/api/authentication/register.password.reset.gateway';
import { logger } from '@configs/logger';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  FindUserCriteria,
  IUserRepository,
  UpdateUserCriteria
} from '@domains/api/users/interfaces';
import bcrypt from 'bcryptjs';
import {
  IChangePasswordGateway,
  IChangePasswordGatewayDependencies
} from '../interfaces/';
import { PasswordResetTokenAttributes } from '../model/password-reset-token.model';
import { IPasswordResetTokenRepository } from '../repository/password-reset-token.repository';

export class ChangePasswordGateway
  extends MixRegisterPasswordResetGateway
  implements IChangePasswordGateway
{
  userRepository: IUserRepository;
  passwordResetTokenRepository: IPasswordResetTokenRepository;
  logging: typeof logger;

  constructor(params: IChangePasswordGatewayDependencies) {
    super(params);
    this.userRepository = params.userRepository;
    this.passwordResetTokenRepository = params.passwordResetTokenRepository;
    this.logging = params.logging;
  }

  async findToken(
    token: string
  ): Promise<PasswordResetTokenAttributes | undefined> {
    this.logging.info('Buscando usuário pelo token', { token });
    return await this.passwordResetTokenRepository.findByToken(token);
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    this.logging.info('Buscando usuário', criteria);
    return await this.userRepository.find(criteria);
  }

  hashPassword(password: string): string {
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
  }

  async updateUser(
    data: Partial<UpdateUserCriteria>,
    criteria: UpdateUserCriteria
  ): Promise<boolean> {
    this.logging.info('Atualizando o usuário', { criteria });
    return await this.userRepository.update(data, criteria);
  }

  async markTokenAsUsed(token: string): Promise<boolean> {
    this.logging.info('Marcando token como usado', { token });
    return await this.passwordResetTokenRepository.markAsUsed(token);
  }
}
