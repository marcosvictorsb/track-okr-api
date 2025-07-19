import PasswordResetTokenModel, {
  PasswordResetTokenAttributes
} from '../model/password-reset-token.model';

export interface IPasswordResetTokenRepository {
  create(
    data: Omit<PasswordResetTokenAttributes, 'id'>
  ): Promise<PasswordResetTokenAttributes>;
  findByToken(token: string): Promise<PasswordResetTokenAttributes | null>;
  findByEmail(email: string): Promise<PasswordResetTokenAttributes[]>;
  markAsUsed(token: string): Promise<boolean>;
  deleteByEmail(email: string): Promise<void>;
}

export class PasswordResetTokenRepository
  implements IPasswordResetTokenRepository
{
  private model: typeof PasswordResetTokenModel;

  constructor() {
    this.model = PasswordResetTokenModel;
  }

  async create(
    data: Omit<PasswordResetTokenAttributes, 'id'>
  ): Promise<PasswordResetTokenAttributes> {
    const result = await this.model.create(data);
    return result.toJSON();
  }

  async findByToken(
    token: string
  ): Promise<PasswordResetTokenAttributes | null> {
    const result = await this.model.findOne({
      where: { token }
    });
    return result ? result.toJSON() : null;
  }

  async findByEmail(email: string): Promise<PasswordResetTokenAttributes[]> {
    const results = await this.model.findAll({
      where: { email, used: false }
    });
    return results.map((result) => result.toJSON());
  }

  async markAsUsed(token: string): Promise<boolean> {
    const [affectedRows] = await this.model.update(
      { used: true },
      { where: { token } }
    );
    return affectedRows > 0;
  }

  async deleteByEmail(email: string): Promise<void> {
    await this.model.destroy({
      where: { email }
    });
  }
}
