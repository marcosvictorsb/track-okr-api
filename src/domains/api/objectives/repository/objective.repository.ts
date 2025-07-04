import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import { ModelStatic } from 'sequelize';
import {
  CreateObjectiveCriteria,
  DeleteObjectiveCriteria,
  FindObjectiveCriteria,
  IObjectiveRepository,
  UpdateObjectiveCriteria,
  ObjectiveRepositoryDependencies
} from '@domains/api/objectives/interfaces';

export class ObjectiveRepository implements IObjectiveRepository {
  protected model: ModelStatic<ObjectiveModel>;

  constructor(params: ObjectiveRepositoryDependencies) {
    this.model = params.model;
  }

  private getConditions(
    criteria: FindObjectiveCriteria
  ): Record<string, unknown> {
    const whereConditions: Record<string, unknown> = {};

    if (criteria.id) {
      whereConditions['id'] = criteria.id;
    }

    if (criteria.title) {
      whereConditions['title'] = criteria.title;
    }

    if (criteria.id_team) {
      whereConditions['id_team'] = criteria.id_team;
    }

    if (criteria.status) {
      whereConditions['status'] = criteria.status;
    }

    if (criteria.quarter) {
      whereConditions['quarter'] = criteria.quarter;
    }

    if (criteria.year) {
      whereConditions['year'] = criteria.year;
    }

    return whereConditions;
  }

  public async create(
    criteria: CreateObjectiveCriteria
  ): Promise<ObjectiveEntity> {
    const objectiveData = {
      ...criteria,
      status: criteria.status || ('active' as const)
    };

    const objective = await this.model.create(objectiveData);
    return new ObjectiveEntity(objective.dataValues);
  }

  public async findOne(
    criteria: FindObjectiveCriteria
  ): Promise<ObjectiveEntity | null> {
    const whereConditions = this.getConditions(criteria);

    const objective = await this.model.findOne({
      where: whereConditions
    });

    if (!objective) {
      return null;
    }

    return new ObjectiveEntity(objective.dataValues);
  }

  public async findMany(
    criteria: FindObjectiveCriteria
  ): Promise<ObjectiveEntity[]> {
    const whereConditions = this.getConditions(criteria);

    const objectives = await this.model.findAll({
      where: whereConditions,
      order: [['created_at', 'DESC']]
    });

    return objectives.map(
      (objective) => new ObjectiveEntity(objective.dataValues)
    );
  }

  public async update(
    criteria: FindObjectiveCriteria,
    data: UpdateObjectiveCriteria
  ): Promise<ObjectiveEntity | null> {
    const whereConditions = this.getConditions(criteria);

    const [affectedRows] = await this.model.update(data, {
      where: whereConditions
    });

    if (affectedRows === 0) {
      return null;
    }

    const updatedObjective = await this.model.findOne({
      where: whereConditions
    });

    if (!updatedObjective) {
      return null;
    }

    return new ObjectiveEntity(updatedObjective.dataValues);
  }

  public async delete(criteria: DeleteObjectiveCriteria): Promise<boolean> {
    const affectedRows = await this.model.destroy({
      where: { id: criteria.id }
    });

    return affectedRows > 0;
  }
}
