import UserModel from '@domains/api/users/model/user.model';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { ModelStatic } from 'sequelize';
import {
  CreateUserCriteria,
  DeleteUserCriteria,
  FindUserCriteria,
  IUserRepository,
  UpdateUserCriteria,
  UserRepositoryDependencies
} from '@domains/api/users/interfaces';

export class UserRepository implements IUserRepository {
  protected model: ModelStatic<UserModel>;

  constructor(params: UserRepositoryDependencies) {
    this.model = params.model;
  }

  private getConditions(criteria: FindUserCriteria): Record<string, any> {
    const whereConditions: Record<string, any> = {};

    if (criteria.id) {
      whereConditions['id'] = criteria.id;
    }

    return whereConditions;
  }

  public async create(criteria: CreateUserCriteria): Promise<UserEntity> {
    const user = await this.model.create(criteria);
    return new UserEntity(user.dataValues);
  }

  public async find(
    criteria: FindUserCriteria
  ): Promise<UserEntity | undefined> {
    const user = await this.model.findOne({
      where: this.getConditions(criteria),
      raw: true
    });

    if (!user) return undefined;

    return new UserEntity(user);
  }

  public async findAll(criteria: FindUserCriteria): Promise<UserEntity[]> {
    const users = await this.model.findAll({
      where: this.getConditions(criteria),
      attributes: {
        exclude: ['password_hash']
      },
      raw: true
    });

    if (!users || users.length === 0) return [];

    return users.map((user: any) => new UserEntity(user));
  }

  public async update(
    criteria: UpdateUserCriteria,
    data: Partial<UpdateUserCriteria>
  ): Promise<boolean> {
    const [affectedRows] = await this.model.update(data, {
      where: { id: criteria.id }
    });
    if (affectedRows === 0) return false;
    return true;
  }

  public async delete(criteria: DeleteUserCriteria): Promise<boolean> {
    const affectedRows = await this.model.destroy({
      where: { id: criteria.id }
    });
    return affectedRows > 0;
  }
}
