import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import { ModelStatic } from 'sequelize';
import TeamModel from '@domains/api/teams/model/team.model';

export type CreateTeamCriteria = {
  name: string;
  description: string;
  amount_users: number;
  id_company: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
};

export type FindTeamCriteria = {
  id?: number;
  name?: string;
  description?: string;
  amount_users?: number;
  id_company?: number;
  limite?: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
};

export type DeleteTeamCriteria = {
  id: number;
};

export type UpdateTeamCriteria = {
  id?: number;
  name?: string;
  description?: string;
  amount_users?: number;
  id_company?: number;
};

export const AMOUNT_USERS_DEFAULT = 0;

export interface ITeamRepository {
  create(criteria: CreateTeamCriteria): Promise<TeamEntity>;
  find(criteria: FindTeamCriteria): Promise<TeamEntity | undefined>;
  findAll(criteria: FindTeamCriteria): Promise<TeamEntity[]>;
  update(
    data: Partial<UpdateTeamCriteria>,
    criteria: UpdateTeamCriteria
  ): Promise<boolean>;
  delete(criteria: DeleteTeamCriteria): Promise<boolean>;
}

export type TeamRepositoryDependencies = {
  model: ModelStatic<TeamModel>;
};
