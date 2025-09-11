import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  IRequestPasswordResetGateway,
  IRequestPasswordResetGatewayDependencies
} from '../interfaces/request-password-reset.interface';
import { IUserRepository } from '@domains/api/users/interfaces';
import { logger } from '@configs/logger';
import { IPasswordResetTokenRepository } from '../repository/password-reset-token.repository';
import crypto from 'crypto';
import { DataLogOutput } from '@adapters/services';
import fs from 'fs';
import path from 'path';
import { MixRegisterPasswordResetGateway } from '@adapters/gateways/api/authentication/register.password.reset.gateway';

export class RequestPasswordResetGateway
  extends MixRegisterPasswordResetGateway
  implements IRequestPasswordResetGateway
{
  userRepository: IUserRepository;
  passwordResetTokenRepository: IPasswordResetTokenRepository;
  logging: typeof logger;

  constructor(params: IRequestPasswordResetGatewayDependencies) {
    super(params);
    this.userRepository = params.userRepository;
    this.passwordResetTokenRepository = params.passwordResetTokenRepository;
    this.logging = params.logging;
  }

  async findUserByEmail(email: string): Promise<UserEntity | undefined> {
    this.logging.info('Buscando usuário por email', { email });
    return await this.userRepository.find({ email });
  }

  generateResetToken(): string {
    const token = crypto.randomBytes(32).toString('hex');
    this.logging.info('Token de reset gerado');
    return token;
  }

  async saveResetToken(
    email: string,
    token: string,
    expiresAt: Date
  ): Promise<boolean> {
    try {
      this.logging.info('Salvando token de reset', { email });

      await this.passwordResetTokenRepository.create({
        email,
        token,
        expires_at: expiresAt,
        used: false
      });

      return true;
    } catch (error) {
      this.logging.error('Erro ao salvar token de reset', {
        email,
        error: String(error)
      });
      return false;
    }
  }

  async deleteExistingTokens(email: string): Promise<void> {
    this.logging.info('Removendo tokens existentes', { email });
    await this.passwordResetTokenRepository.deleteByEmail(email);
  }

  async sendPasswordResetEmail(
    email: string,
    resetLink: string,
    userName: string,
    expiryDate: string
  ): Promise<boolean> {
    try {
      this.logging.info('Enviando email de reset de senha', { email });

      const templatePath = path.join(
        __dirname,
        '../../../../templates/password-reset.template.html'
      );
      let emailTemplate = fs.readFileSync(templatePath, 'utf8');

      // Substituir placeholders no template
      emailTemplate = emailTemplate
        .replace(/{{userName}}/g, userName)
        .replace(/{{resetLink}}/g, resetLink)
        .replace(/{{expiryDate}}/g, expiryDate);

      await this.sendEmail('Redefinir Senha - Gunno', email, emailTemplate);

      this.logging.info('Email de reset de senha enviado com sucesso', {
        email
      });
      return true;
    } catch (error) {
      this.logging.error('Erro ao enviar email de reset de senha', {
        email,
        error: String(error)
      });
      return false;
    }
  }
}
