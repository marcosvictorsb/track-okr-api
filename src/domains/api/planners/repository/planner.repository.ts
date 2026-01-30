import { PlannerEntity } from '@domains/api/planners/entity/planner.entity';
import {
  CreatePlannerCriteria,
  DeletePlannerCriteria,
  FindPlannerCriteria,
  IPlannerRepository,
  PlannerRepositoryDependencies,
  UpdatePlannerCriteria
} from '@domains/api/planners/interfaces';
import PlannerModel from '@domains/api/planners/model/planner.model';
import { ModelStatic, Op } from 'sequelize';

export class PlannerRepository implements IPlannerRepository {
  protected model: ModelStatic<PlannerModel>;

  constructor(params: PlannerRepositoryDependencies) {
    this.model = params.model;
  }

  private getConditions(criteria: FindPlannerCriteria): Record<string, any> {
    const whereConditions: Record<string, any> = {};

    if (criteria.id) {
      whereConditions['id'] = criteria.id;
    }

    if (criteria.title) {
      whereConditions['title'] = criteria.title;
    }

    if (criteria.description) {
      whereConditions['description'] = criteria.description;
    }

    if (criteria.year) {
      whereConditions['year'] = criteria.year;
    }

    if (criteria.id_company) {
      whereConditions['id_company'] = criteria.id_company;
    }

    if (criteria.id_user) {
      whereConditions['id_user'] = criteria.id_user;
    }

    if (criteria.created_after || criteria.created_before) {
      const dateConditions: Record<symbol, Date> = {};
      if (criteria.created_after) {
        dateConditions[Op.gte] = criteria.created_after;
      }

      if (criteria.created_before) {
        dateConditions[Op.lte] = criteria.created_before;
      }

      whereConditions.created_at = dateConditions;
    }

    return whereConditions;
  }

  public async create(criteria: CreatePlannerCriteria): Promise<PlannerEntity> {
    const planner = await this.model.create(criteria);
    return new PlannerEntity(planner.dataValues);
  }

  public async find(
    criteria: FindPlannerCriteria
  ): Promise<PlannerEntity | undefined> {
    const planner = await this.model.findOne({
      where: this.getConditions(criteria),
      raw: true
    });

    if (!planner) return undefined;

    return new PlannerEntity(planner);
  }

  public async findAll(
    criteria: FindPlannerCriteria
  ): Promise<PlannerEntity[]> {
    const planners = await this.model.findAll({
      where: this.getConditions(criteria),
      attributes: {
        exclude: ['password_hash']
      },
      raw: true
    });

    if (!planners || planners.length === 0) return [];

    return planners.map(
      (planner: PlannerEntity) =>
        new PlannerEntity({
          id: planner.id,
          title: planner.title,
          description: planner.description,
          year: planner.year,
          id_company: planner.id_company,
          created_at: planner.created_at
        })
    );
  }

  public async update(
    data: Partial<UpdatePlannerCriteria>,
    criteria: UpdatePlannerCriteria
  ): Promise<boolean> {
    const [affectedRows] = await this.model.update(data, {
      where: { id: criteria.id }
    });
    if (affectedRows === 0) return false;
    return true;
  }

  public async delete(criteria: DeletePlannerCriteria): Promise<boolean> {
    const affectedRows = await this.model.destroy({
      where: { id: criteria.id }
    });
    return affectedRows > 0;
  }

  public async count(criteria: FindPlannerCriteria): Promise<number> {
    return await this.model.count({
      where: this.getConditions(criteria)
    });
  }
}
