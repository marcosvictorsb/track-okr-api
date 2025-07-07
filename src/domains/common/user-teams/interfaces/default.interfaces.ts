import { UserTeamEntity } from '../entity/user-team.entity';
import { ModelStatic } from 'sequelize';
import UserTeamModel from '../model/user-team.model';

export enum UserTeamRole {
  MEMBER = 'member',
  LEADER = 'leader',
  ADMIN = 'admin'
}

export type CreateUserTeamCriteria = {
  id_user: number;
  id_team: number;
  role_in_team?: string;
};

export type FindUserTeamCriteria = {
  id?: number;
  idsUser?: number[];
  id_user?: number;
  id_team?: number;
  role_in_team?: string;
};

export type UpdateUserTeamCriteria = {
  id?: number;
  id_user?: number;
  id_team?: number;
};

export type DeleteUserTeamCriteria = {
  id?: number;
  id_user?: number;
  id_team?: number;
};

export interface IUserTeamRepository {
  create(criteria: CreateUserTeamCriteria): Promise<UserTeamEntity>;
  find(criteria: FindUserTeamCriteria): Promise<UserTeamEntity | undefined>;
  findAll(criteria: FindUserTeamCriteria): Promise<UserTeamEntity[]>;
  update(
    data: Partial<UpdateUserTeamCriteria>,
    criteria: UpdateUserTeamCriteria
  ): Promise<boolean>;
  delete(criteria: DeleteUserTeamCriteria): Promise<boolean>;
}

export type UserTeamRepositoryDependencies = {
  model: ModelStatic<UserTeamModel>;
};
