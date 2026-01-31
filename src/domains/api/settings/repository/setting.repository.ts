import { ModelStatic } from 'sequelize';
import { SettingEntity } from '../entity/setting.entity';
import {
  CreateSettingCriteria,
  DeleteSettingCriteria,
  FindSettingCriteria,
  ISettingRepository,
  SettingRepositoryDependencies,
  UpdateSettingCriteria
} from '../interfaces/default.interfaces';
import SettingModel, { SettingModelAttributes } from '../model/setting.model';

export class SettingRepository implements ISettingRepository {
  protected model: ModelStatic<SettingModel>;

  constructor(params: SettingRepositoryDependencies) {
    this.model = params.model;
  }

  private getConditions(
    criteria: FindSettingCriteria
  ): Record<string, unknown> {
    const conditions: Record<string, unknown> = {};

    if (criteria.id) conditions.id = criteria.id;
    if (criteria.id_company) conditions.id_company = criteria.id_company;
    if (criteria.block_okr_creation !== undefined)
      conditions.block_okr_creation = criteria.block_okr_creation;
    if (criteria.block_key_result_creation !== undefined)
      conditions.block_key_result_creation = criteria.block_key_result_creation;
    if (criteria.block_okr_editing !== undefined)
      conditions.block_okr_editing = criteria.block_okr_editing;
    if (criteria.block_key_result_editing !== undefined)
      conditions.block_key_result_editing = criteria.block_key_result_editing;
    if (criteria.current_quarter_only !== undefined)
      conditions.current_quarter_only = criteria.current_quarter_only;

    return conditions;
  }

  public async create(criteria: CreateSettingCriteria): Promise<SettingEntity> {
    const setting = await this.model.create(criteria as SettingModelAttributes);

    return new SettingEntity({
      id: setting.id,
      block_okr_creation: setting.block_okr_creation,
      block_key_result_creation: setting.block_key_result_creation,
      block_okr_editing: setting.block_okr_editing,
      block_key_result_editing: setting.block_key_result_editing,
      allowed_quarters: setting.allowed_quarters,
      current_quarter_only: setting.current_quarter_only,
      id_company: setting.id_company,
      created_at: setting.created_at,
      updated_at: setting.updated_at
    });
  }

  public async find(
    criteria: FindSettingCriteria
  ): Promise<SettingEntity | undefined> {
    const setting = await this.model.findOne({
      where: this.getConditions(criteria),
      raw: true
    });

    if (!setting) return undefined;

    return new SettingEntity({
      id: setting.id,
      block_okr_creation: setting.block_okr_creation,
      block_key_result_creation: setting.block_key_result_creation,
      block_okr_editing: setting.block_okr_editing,
      block_key_result_editing: setting.block_key_result_editing,
      allowed_quarters: setting.allowed_quarters,
      current_quarter_only: setting.current_quarter_only,
      id_company: setting.id_company,
      created_at: setting.created_at,
      updated_at: setting.updated_at
    });
  }

  public async findAll(
    criteria: FindSettingCriteria
  ): Promise<SettingEntity[]> {
    const settings = await this.model.findAll({
      where: this.getConditions(criteria),
      raw: true
    });

    if (!settings || settings.length === 0) return [];

    return settings.map(
      (setting: SettingModel) =>
        new SettingEntity({
          id: setting.id,
          block_okr_creation: setting.block_okr_creation,
          block_key_result_creation: setting.block_key_result_creation,
          block_okr_editing: setting.block_okr_editing,
          block_key_result_editing: setting.block_key_result_editing,
          allowed_quarters: setting.allowed_quarters,
          current_quarter_only: setting.current_quarter_only,
          id_company: setting.id_company,
          created_at: setting.created_at,
          updated_at: setting.updated_at
        })
    );
  }

  public async update(
    data: Partial<UpdateSettingCriteria>,
    criteria: UpdateSettingCriteria
  ): Promise<boolean> {
    const [affectedRows] = await this.model.update(data, {
      where: { id: criteria.id }
    });
    if (affectedRows === 0) return false;
    return true;
  }

  public async delete(criteria: DeleteSettingCriteria): Promise<boolean> {
    const affectedRows = await this.model.destroy({
      where: { id: criteria.id }
    });
    if (affectedRows === 0) return false;
    return true;
  }
}
