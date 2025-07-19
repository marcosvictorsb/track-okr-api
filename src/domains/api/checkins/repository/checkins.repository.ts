import { ModelStatic, Op } from 'sequelize';
import {
  CreateCheckinsCriteria,
  FindCheckinsCriteria,
  UpdateCheckinsCriteria,
  ICheckinsRepository
} from '../interfaces/default.interface';
import { CheckinsEntity } from '../entity/checkins.entity';
import CheckinsModel from '@domains/api/checkins/model/checkin.model';

export type CheckinsRepositoryDependencies = {
  model: ModelStatic<CheckinsModel>;
};

export class CheckinsRepository implements ICheckinsRepository {
  private model: ModelStatic<CheckinsModel>;

  constructor(params: CheckinsRepositoryDependencies) {
    this.model = params.model;
  }

  private getConditions(criteria: FindCheckinsCriteria) {
    const conditions: Record<string, unknown> = {};

    if (criteria.id !== undefined) conditions.id = criteria.id;
    if (criteria.id_result_key !== undefined)
      conditions.id_result_key = criteria.id_result_key;
    if (criteria.ids_result_key && criteria.ids_result_key?.length) {
      conditions.id_result_key = {
        [Op.in]: criteria.ids_result_key
      };
    }
    if (criteria.id_user !== undefined) conditions.id_user = criteria.id_user;
    if (criteria.created_at !== undefined)
      conditions.created_at = criteria.created_at;
    if (criteria.new_value !== undefined)
      conditions.new_value = criteria.new_value;
    if (criteria.previous_value !== undefined)
      conditions.previous_value = criteria.previous_value;

    return conditions;
  }

  public async create(
    criteria: CreateCheckinsCriteria
  ): Promise<CheckinsEntity> {
    const Checkins = await this.model.create({
      ...criteria,
      created_at: new Date()
    });

    return new CheckinsEntity(Checkins.toJSON());
  }

  public async findOne(
    criteria: FindCheckinsCriteria
  ): Promise<CheckinsEntity | null> {
    const Checkins = await this.model.findOne({
      where: this.getConditions(criteria),
      include: [
        {
          association: 'user',
          attributes: ['id', 'name']
        },
        {
          association: 'result_key',
          attributes: ['id', 'name']
        }
      ],
      raw: false
    });

    if (!Checkins) return null;

    const data = Checkins.toJSON() as CheckinsEntity & {
      user?: { id: number; name: string };
      result_key?: { id: number; name: string };
    };

    return new CheckinsEntity({
      ...data,
      user_name: data.user?.name,
      result_key_name: data.result_key?.name
    });
  }

  public async findMany(
    criteria: FindCheckinsCriteria
  ): Promise<CheckinsEntity[]> {
    const Checkinss = await this.model.findAll({
      where: this.getConditions(criteria),
      include: [
        {
          association: 'user',
          attributes: ['id', 'name']
        },
        {
          association: 'result_key',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']],
      raw: false
    });

    if (!Checkinss || Checkinss.length === 0) return [];

    return Checkinss.map((update) => {
      const data = update.toJSON() as CheckinsEntity & {
        user?: { id: number; name: string };
        result_key?: { id: number; name: string };
      };

      return new CheckinsEntity({
        id: data.id,
        id_result_key: data.id_result_key,
        previous_value: data.previous_value,
        new_value: data.new_value,
        comment: data.comment,
        id_user: data.id_user,
        created_at: data.created_at,
        user_name: data.user?.name,
        result_key_name: data.result_key?.name
      });
    });
  }

  public async findByResultKeyId(
    id_result_key: number
  ): Promise<CheckinsEntity[]> {
    return this.findMany({ id_result_key });
  }

  public async update(
    criteria: FindCheckinsCriteria,
    data: UpdateCheckinsCriteria
  ): Promise<CheckinsEntity | null> {
    const [affectedRows] = await this.model.update(
      { ...data, updated_at: new Date() },
      { where: this.getConditions(criteria) }
    );

    if (affectedRows === 0) return null;

    return this.findOne(criteria);
  }

  public async delete(criteria: FindCheckinsCriteria): Promise<boolean> {
    const affectedRows = await this.model.destroy({
      where: this.getConditions(criteria)
    });

    return affectedRows > 0;
  }
}
