import {
  BackofficeUserModel,
  BackofficeUserAttributes,
  BackofficeUserCreationAttributes
} from '@infra/database/models/backoffice-user.model';
import { BackofficeUserEntity } from '../entities/backoffice-user.entity';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
export interface IBackofficeUserRepository {
  // Métodos principais que retornam entidades (uso comum)
  create(
    userData: BackofficeUserCreationAttributes
  ): Promise<BackofficeUserEntity>;
  findById(id: number): Promise<BackofficeUserEntity | null>;
  findByEmail(email: string): Promise<BackofficeUserEntity | null>;
  findByEmailWithPassword(email: string): Promise<BackofficeUserEntity | null>; // Precisa do modelo para validação de senha
  findAll(includeInactive?: boolean): Promise<BackofficeUserEntity[]>;
  update(
    id: number,
    userData: Partial<BackofficeUserAttributes>
  ): Promise<BackofficeUserEntity | null>;

  // Métodos auxiliares
  updateLastLogin(id: number, ip?: string): Promise<void>;
  deactivate(id: number): Promise<boolean>;
  generatePasswordResetToken(email: string): Promise<string | null>;
  findByResetToken(token: string): Promise<BackofficeUserModel | null>; // Precisa do modelo para reset
  resetPassword(token: string, newPassword: string): Promise<boolean>;

  // Métodos que retornam modelos Sequelize (para casos específicos)
  findByIdModel(id: number): Promise<BackofficeUserModel | null>;
  findByEmailModel(email: string): Promise<BackofficeUserModel | null>;
  findAllModels(includeInactive?: boolean): Promise<BackofficeUserModel[]>;
  createModel(
    userData: BackofficeUserCreationAttributes
  ): Promise<BackofficeUserModel>;

  // Métodos correspondentes que retornam entidades
  createEntity(
    userData: BackofficeUserCreationAttributes
  ): Promise<BackofficeUserEntity>;
  findByIdEntity(id: number): Promise<BackofficeUserEntity | null>;
  findByEmailEntity(email: string): Promise<BackofficeUserEntity | null>;
  findAllEntities(includeInactive?: boolean): Promise<BackofficeUserEntity[]>;
  findByEmailWithPasswordEntity(
    email: string
  ): Promise<BackofficeUserEntity | null>;
}

export class BackofficeUserRepository implements IBackofficeUserRepository {
  // ==============================================
  // MÉTODOS PRINCIPAIS (RETORNAM ENTIDADES)
  // ==============================================

  async create(
    userData: BackofficeUserCreationAttributes
  ): Promise<BackofficeUserEntity> {
    const model = await this.createModel(userData);
    return new BackofficeUserEntity(model.dataValues);
  }

  async findById(id: number): Promise<BackofficeUserEntity | null> {
    const model = await this.findByIdModel(id);
    return model ? new BackofficeUserEntity(model.dataValues) : null;
  }

  async findByEmail(email: string): Promise<BackofficeUserEntity | null> {
    const model = await this.findByEmailModel(email);
    return model ? new BackofficeUserEntity(model.dataValues) : null;
  }

  async findAll(
    includeInactive: boolean = false
  ): Promise<BackofficeUserEntity[]> {
    const models = await this.findAllModels(includeInactive);
    return models.map((model) => new BackofficeUserEntity(model.dataValues));
  }

  async update(
    id: number,
    userData: Partial<BackofficeUserAttributes>
  ): Promise<BackofficeUserEntity | null> {
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

  // ==============================================
  // MÉTODOS QUE RETORNAM MODELOS SEQUELIZE
  // ==============================================

  async createModel(
    userData: BackofficeUserCreationAttributes
  ): Promise<BackofficeUserModel> {
    // Criptografar senha antes de salvar
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    return await BackofficeUserModel.create({
      ...userData,
      password: hashedPassword,
      id: 0,
      created_at: new Date(),
      updated_at: new Date(),
      is_active: userData.is_active !== undefined ? userData.is_active : true
    });
  }

  async findByIdModel(id: number): Promise<BackofficeUserModel | null> {
    return await BackofficeUserModel.findByPk(id);
  }

  async findByEmailModel(email: string): Promise<BackofficeUserModel | null> {
    return await BackofficeUserModel.findOne({
      where: { email: email.toLowerCase() }
    });
  }

  async findAllModels(
    includeInactive: boolean = false
  ): Promise<BackofficeUserModel[]> {
    const whereClause = includeInactive ? {} : { is_active: true };

    return await BackofficeUserModel.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });
  }

  async findByEmailWithPassword(
    email: string
  ): Promise<BackofficeUserEntity | null> {
    const user = await BackofficeUserModel.scope('withPassword').findOne({
      where: { email: email.toLowerCase() }
    });

    return user ? new BackofficeUserEntity(user) : null;
  }

  // ==============================================
  // MÉTODOS CORRESPONDENTES QUE RETORNAM ENTIDADES
  // ==============================================

  async createEntity(
    userData: BackofficeUserCreationAttributes
  ): Promise<BackofficeUserEntity> {
    const model = await this.createModel(userData);
    return new BackofficeUserEntity(model.dataValues);
  }

  async findByIdEntity(id: number): Promise<BackofficeUserEntity | null> {
    const model = await this.findByIdModel(id);
    return model ? new BackofficeUserEntity(model.dataValues) : null;
  }

  async findByEmailEntity(email: string): Promise<BackofficeUserEntity | null> {
    const model = await this.findByEmailModel(email);
    return model ? new BackofficeUserEntity(model.dataValues) : null;
  }

  async findAllEntities(
    includeInactive: boolean = false
  ): Promise<BackofficeUserEntity[]> {
    const models = await this.findAllModels(includeInactive);
    return models.map((model) => new BackofficeUserEntity(model.dataValues));
  }

  async findByEmailWithPasswordEntity(
    email: string
  ): Promise<BackofficeUserEntity | null> {
    const model = await this.findByEmailWithPassword(email);
    return model ? new BackofficeUserEntity(model) : null;
  }

  // ==============================================
  // MÉTODOS AUXILIARES
  // ==============================================

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
    const user = await this.findByEmailModel(email);
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
