import { UserEntity } from '@domains/api/users/entity/user.entity';
import { ModelStatic } from 'sequelize';
import UserModel from '@domains/api/users/model/user.model';

export type UserStatus = {
  ACTIVE: 'active';
  CANCELLED: 'cancelled';
};

export type CreateUserCriteria = {
  name: string;
  email: string;
  password_hash: string;
  role: string;
  status: string;
  id_company: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
};

export type FindUserCriteria = {
  id?: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  status: string;
  id_company: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
};

export type DeleteUserCriteria = {
  id: number;
};

export type UpdateUserCriteria = {
  id?: number
  name?: string;
  email?: string;
  password_hash?: string;
  role?: string;
  status?: string;
  id_company?: number;
};

export interface IUserRepository {
  create(criteria: CreateUserCriteria): Promise<UserEntity>;
  find(
    criteria: FindUserCriteria
  ): Promise<UserEntity | undefined>;
  // findAll(criteria: FindUserCriteria): Promise<UserEntity[]>;
  update(
    criteria: UpdateUserCriteria,
    data: Partial<UserEntity>
  ): Promise<boolean>;
  delete(criteria: DeleteUserCriteria): Promise<boolean>;
}

export type UserRepositoryDependencies = {
  model: ModelStatic<UserModel>;
};
