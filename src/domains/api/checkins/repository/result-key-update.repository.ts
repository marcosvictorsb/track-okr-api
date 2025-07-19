import { ModelStatic, Op } from 'sequelize';
import {
  CreateResultKeyUpdateCriteria,
  FindResultKeyUpdateCriteria,
  UpdateResultKeyUpdateCriteria,
  IResultKeyUpdateRepository
} from '../interfaces/result-key-update.interface';
import { ResultKeyUpdateEntity } from '../entity/result-key-update.entity';
import ResultKeyUpdateModel from '@domains/api/checkins/model/result-key-update.model';

export type ResultKeyUpdateRepositoryDependencies = {
  model: ModelStatic<ResultKeyUpdateModel>;
};

export class ResultKeyUpdateRepository implements IResultKeyUpdateRepository {
  private model: ModelStatic<ResultKeyUpdateModel>;

  constructor(params: ResultKeyUpdateRepositoryDependencies) {
    this.model = params.model;
  }

  private getConditions(criteria: FindResultKeyUpdateCriteria) {
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
    criteria: CreateResultKeyUpdateCriteria
  ): Promise<ResultKeyUpdateEntity> {
    const resultKeyUpdate = await this.model.create({
      ...criteria,
      created_at: new Date()
    });

    return new ResultKeyUpdateEntity(resultKeyUpdate.toJSON());
  }

  public async findOne(
    criteria: FindResultKeyUpdateCriteria
  ): Promise<ResultKeyUpdateEntity | null> {
    const resultKeyUpdate = await this.model.findOne({
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

    if (!resultKeyUpdate) return null;

    const data = resultKeyUpdate.toJSON() as ResultKeyUpdateEntity & {
      user?: { id: number; name: string };
      result_key?: { id: number; name: string };
    };

    return new ResultKeyUpdateEntity({
      ...data,
      user_name: data.user?.name,
      result_key_name: data.result_key?.name
    });
  }

  public async findMany(
    criteria: FindResultKeyUpdateCriteria
  ): Promise<ResultKeyUpdateEntity[]> {
    const resultKeyUpdates = await this.model.findAll({
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

    if (!resultKeyUpdates || resultKeyUpdates.length === 0) return [];

    return resultKeyUpdates.map((update) => {
      const data = update.toJSON() as ResultKeyUpdateEntity & {
        user?: { id: number; name: string };
        result_key?: { id: number; name: string };
      };

      return new ResultKeyUpdateEntity({
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
  ): Promise<ResultKeyUpdateEntity[]> {
    return this.findMany({ id_result_key });
  }

  public async update(
    criteria: FindResultKeyUpdateCriteria,
    data: UpdateResultKeyUpdateCriteria
  ): Promise<ResultKeyUpdateEntity | null> {
    const [affectedRows] = await this.model.update(
      { ...data, updated_at: new Date() },
      { where: this.getConditions(criteria) }
    );

    if (affectedRows === 0) return null;

    return this.findOne(criteria);
  }

  public async delete(criteria: FindResultKeyUpdateCriteria): Promise<boolean> {
    const affectedRows = await this.model.destroy({
      where: this.getConditions(criteria)
    });

    return affectedRows > 0;
  }
}
