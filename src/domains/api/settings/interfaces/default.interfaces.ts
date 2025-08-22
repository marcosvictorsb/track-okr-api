import { SettingEntity } from '@domains/api/settings/entity/setting.entity';
import { ModelStatic } from 'sequelize';
import SettingModel from '@domains/api/settings/model/setting.model';

export type CreateSettingCriteria = {
  block_okr_creation?: boolean;
  block_key_result_creation?: boolean;
  block_okr_editing?: boolean;
  block_key_result_editing?: boolean;
  allowed_quarters?: number[];
  current_quarter_only?: boolean;
  id_company: number;
  created_at?: Date;
  updated_at?: Date;
};

export type FindSettingCriteria = {
  id?: number;
  block_okr_creation?: boolean;
  block_key_result_creation?: boolean;
  block_okr_editing?: boolean;
  block_key_result_editing?: boolean;
  allowed_quarters?: number[];
  current_quarter_only?: boolean;
  id_company?: number;
  created_at?: Date;
  updated_at?: Date;
};

export type DeleteSettingCriteria = {
  id: number;
};

export type UpdateSettingCriteria = {
  id?: number;
  block_okr_creation?: boolean;
  block_key_result_creation?: boolean;
  block_okr_editing?: boolean;
  block_key_result_editing?: boolean;
  allowed_quarters?: number[];
  current_quarter_only?: boolean;
  id_company?: number;
};

export interface ISettingRepository {
  create(criteria: CreateSettingCriteria): Promise<SettingEntity>;
  find(criteria: FindSettingCriteria): Promise<SettingEntity | undefined>;
  findAll(criteria: FindSettingCriteria): Promise<SettingEntity[]>;
  update(
    data: Partial<UpdateSettingCriteria>,
    criteria: UpdateSettingCriteria
  ): Promise<boolean>;
  delete(criteria: DeleteSettingCriteria): Promise<boolean>;
}

export type SettingRepositoryDependencies = {
  model: ModelStatic<SettingModel>;
};
