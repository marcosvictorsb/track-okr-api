import PlannerModel from '@domains/api/planners/model/planner.model';
import { PlannerEntity } from '@domains/api/planners/entity/planner.entity';
import { ModelStatic } from 'sequelize';
import {
  CreatePlannerCriteria,
  DeletePlannerCriteria,
  FindPlannerCriteria,
  IPlannerRepository,
  UpdatePlannerCriteria,
  PlannerRepositoryDependencies
} from '@domains/api/planners/interfaces';

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

    return whereConditions;
  }

  public async create(criteria: CreatePlannerCriteria): Promise<PlannerEntity> {
    const Planner = await this.model.create(criteria);
    return new PlannerEntity(Planner.dataValues);
  }

  public async find(
    criteria: FindPlannerCriteria
  ): Promise<PlannerEntity | undefined> {
    const Planner = await this.model.findOne({
      where: this.getConditions(criteria),
      raw: true
    });

    if (!Planner) return undefined;

    return new PlannerEntity(Planner);
  }

  public async findAll(criteria: FindPlannerCriteria): Promise<PlannerEntity[]> {
    const Planners = await this.model.findAll({
      where: this.getConditions(criteria),
      attributes: {
        exclude: ['password_hash']
      },
      raw: true
    });

    if (!Planners || Planners.length === 0) return [];

    return Planners.map((Planner: any) => new PlannerEntity(Planner));
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
}
