import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  IConfirmPasswordResetGateway,
  IConfirmPasswordResetGatewayDependencies
} from '../interfaces/confirm-password-reset.interface';
import { IUserRepository } from '@domains/api/users/interfaces';
import { logger } from '@configs/logger';
import { IPasswordResetTokenRepository } from '../repository/password-reset-token.repository';
import { DataLogOutput } from '@adapters/services';
import bcrypt from 'bcryptjs';

export class ConfirmPasswordResetGateway
  implements IConfirmPasswordResetGateway
{
  userRepository: IUserRepository;
  passwordResetTokenRepository: IPasswordResetTokenRepository;
  logging: typeof logger;

  constructor(params: IConfirmPasswordResetGatewayDependencies) {
    this.userRepository = params.userRepository;
    this.passwordResetTokenRepository = params.passwordResetTokenRepository;
    this.logging = params.logging;
  }

  async findValidToken(
    token: string
  ): Promise<{ email: string; expires_at: Date } | null> {
    try {
      this.logging.info('Buscando token de reset', { token });

      const tokenData =
        await this.passwordResetTokenRepository.findByToken(token);

      if (!tokenData) {
        this.logging.info('Token não encontrado', { token });
        return null;
      }

      if (tokenData.used) {
        this.logging.info('Token já foi utilizado', { token });
        return null;
      }

      if (new Date() > new Date(tokenData.expires_at)) {
        this.logging.info('Token expirado', {
          token,
          expires_at: tokenData.expires_at
        });
        return null;
      }

      return {
        email: tokenData.email,
        expires_at: tokenData.expires_at
      };
    } catch (error) {
      this.logging.error('Erro ao buscar token', {
        token,
        error: String(error)
      });
      return null;
    }
  }

  async findUserByEmail(email: string): Promise<UserEntity | undefined> {
    this.logging.info('Buscando usuário por email', { email });
    return await this.userRepository.find({ email });
  }

  async updateUserPassword(
    email: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      this.logging.info('Atualizando senha do usuário', { email });

      const user = await this.userRepository.find({ email });
      if (!user || !user.id) {
        this.logging.error('Usuário não encontrado para atualização de senha', {
          email
        });
        return false;
      }

      const updated = await this.userRepository.update(
        { password_hash: hashedPassword },
        { id: user.id }
      );

      return updated;
    } catch (error) {
      this.logging.error('Erro ao atualizar senha', {
        email,
        error: String(error)
      });
      return false;
    }
  }

  async markTokenAsUsed(token: string): Promise<boolean> {
    try {
      this.logging.info('Marcando token como usado', { token });
      return await this.passwordResetTokenRepository.markAsUsed(token);
    } catch (error) {
      this.logging.error('Erro ao marcar token como usado', {
        token,
        error: String(error)
      });
      return false;
    }
  }

  hashPassword(password: string): string {
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
  }

  loggerInfo(message: string, data?: DataLogOutput): void {
    this.logging.info(message, data);
  }

  loggerError(message: string, data?: DataLogOutput): void {
    this.logging.error(message, data);
  }
}
