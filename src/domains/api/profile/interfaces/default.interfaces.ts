import { ProfileEntity } from '@domains/api/profile/entity/profile.entity';
import { ModelStatic } from 'sequelize';
import ProfileModel from '@domains/api/profile/model/profile.model';

export type CreateProfileCriteria = {
  id_user: number;
  photo_url?: string | null;
  position?: string | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
};

export type FindProfileCriteria = {
  id?: number;
  ids?: number[];
  id_users?: number[];
  id_user?: number;
  photo_url?: string;
  position?: string;
  limite?: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
};

export type DeleteProfileCriteria = {
  id: number;
};

export type UpdateProfileCriteria = {
  id?: number;
  id_user?: number;
  photo_url?: string | null;
  position?: string | null;
};

export interface IProfileRepository {
  create(criteria: CreateProfileCriteria): Promise<ProfileEntity>;
  find(criteria: FindProfileCriteria): Promise<ProfileEntity | undefined>;
  findAll(criteria: FindProfileCriteria): Promise<ProfileEntity[]>;
  findByUserId(id_user: number): Promise<ProfileEntity | undefined>;
  update(
    criteria: UpdateProfileCriteria,
    data: Partial<ProfileEntity>
  ): Promise<boolean>;
  delete(criteria: DeleteProfileCriteria): Promise<boolean>;
  upsert(criteria: CreateProfileCriteria): Promise<ProfileEntity>;
}

export type ProfileRepositoryDependencies = {
  model: ModelStatic<ProfileModel>;
};
