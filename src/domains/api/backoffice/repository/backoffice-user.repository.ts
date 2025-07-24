import {
  BackofficeUserModel,
  BackofficeUserAttributes,
  BackofficeUserCreationAttributes
} from '@infra/database/models/backoffice-user.model';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface IBackofficeUserRepository {
  create(
    userData: BackofficeUserCreationAttributes
  ): Promise<BackofficeUserModel>;
  findById(id: number): Promise<BackofficeUserModel | null>;
  findByEmail(email: string): Promise<BackofficeUserModel | null>;
  findByEmailWithPassword(email: string): Promise<BackofficeUserModel | null>;
  findAll(includeInactive?: boolean): Promise<BackofficeUserModel[]>;
  update(
    id: number,
    userData: Partial<BackofficeUserAttributes>
  ): Promise<BackofficeUserModel | null>;
  updateLastLogin(id: number, ip?: string): Promise<void>;
  deactivate(id: number): Promise<boolean>;
  generatePasswordResetToken(email: string): Promise<string | null>;
  findByResetToken(token: string): Promise<BackofficeUserModel | null>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;
}

export class BackofficeUserRepository implements IBackofficeUserRepository {
  async create(
    userData: BackofficeUserCreationAttributes
  ): Promise<BackofficeUserModel> {
    // Criptografar senha antes de salvar
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    return await BackofficeUserModel.create({
      ...userData,
      password: hashedPassword
    });
  }

  async findById(id: number): Promise<BackofficeUserModel | null> {
    return await BackofficeUserModel.findByPk(id);
  }

  async findByEmail(email: string): Promise<BackofficeUserModel | null> {
    return await BackofficeUserModel.findOne({
      where: { email: email.toLowerCase() }
    });
  }

  async findByEmailWithPassword(
    email: string
  ): Promise<BackofficeUserModel | null> {
    return await BackofficeUserModel.scope('withPassword').findOne({
      where: { email: email.toLowerCase() }
    });
  }

  async findAll(
    includeInactive: boolean = false
  ): Promise<BackofficeUserModel[]> {
    const whereClause = includeInactive ? {} : { is_active: true };

    return await BackofficeUserModel.findAll({
      where: whereClause,
      include: [
        {
          model: BackofficeUserModel,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async update(
    id: number,
    userData: Partial<BackofficeUserAttributes>
  ): Promise<BackofficeUserModel | null> {
    const updateData = { ...userData };

    // Se estiver atualizando a senha, criptografar
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12);
    }

    // Normalizar email
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase();
    }

    const [affectedRows] = await BackofficeUserModel.update(updateData, {
      where: { id }
    });

    if (affectedRows === 0) {
      return null;
    }

    return await this.findById(id);
  }

  async updateLastLogin(id: number, ip?: string): Promise<void> {
    await BackofficeUserModel.update(
      {
        last_login: new Date(),
        last_login_ip: ip
      },
      { where: { id } }
    );
  }

  async deactivate(id: number): Promise<boolean> {
    const [affectedRows] = await BackofficeUserModel.update(
      { is_active: false },
      { where: { id } }
    );

    return affectedRows > 0;
  }

  async generatePasswordResetToken(email: string): Promise<string | null> {
    const user = await this.findByEmail(email);
    if (!user || !user.is_active) {
      return null;
    }

    // Gerar token seguro
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Token expira em 1 hora
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 1);

    await BackofficeUserModel.update(
      {
        password_reset_token: hashedToken,
        password_reset_expires: expirationTime
      },
      { where: { id: user.id } }
    );

    return resetToken; // Retorna o token não hasheado para envio por email
  }

  async findByResetToken(token: string): Promise<BackofficeUserModel | null> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    return await BackofficeUserModel.scope('withResetToken').findOne({
      where: {
        password_reset_token: hashedToken,
        password_reset_expires: {
          [Op.gt]: new Date()
        },
        is_active: true
      }
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.findByResetToken(token);
    if (!user) {
      return false;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const [affectedRows] = await BackofficeUserModel.update(
      {
        password: hashedPassword,
        password_reset_token: undefined,
        password_reset_expires: undefined
      },
      { where: { id: user.id } }
    );

    return affectedRows > 0;
  }

  // Método auxiliar para verificar senha
  async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
