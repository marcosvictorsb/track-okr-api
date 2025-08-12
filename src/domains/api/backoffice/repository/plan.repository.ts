import { PlanModel } from '@domains/api/backoffice/models/plan.model';
import {
  CreatePlanCriteria,
  FindPlansCriteria,
  IPlanRepository,
  PlannerRepositoryDependencies
} from '../interfaces/default.interfaces';
import { ModelStatic, Op } from 'sequelize';
import { PlanEntity } from '../entities/plan.entity';

export class PlanRepository implements IPlanRepository {
  protected model: ModelStatic<PlanModel>;

  constructor(params: PlannerRepositoryDependencies) {
    this.model = params.model;
  }

  private getConditions(criteria: FindPlansCriteria): Record<string, any> {
    const whereConditions: Record<string, any> = {};

    if (criteria.id) {
      whereConditions['id'] = criteria.id;
    }

    if (criteria.name) {
      whereConditions['name'] = criteria.name;
    }

    if (criteria.isTrial) {
      whereConditions['isTrial'] = criteria.isTrial;
    }

    return whereConditions;
  }

  async create(data: CreatePlanCriteria): Promise<PlanEntity> {
    const plan = await this.model.create(data);
    return new PlanEntity(plan.dataValues);
  }

  public async find(
    criteria: FindPlansCriteria
  ): Promise<PlanEntity | undefined> {
    const planner = await this.model.findOne({
      where: this.getConditions(criteria),
      raw: true
    });

    if (!planner) return undefined;

    return new PlanEntity(planner);
  }

  public async findAll(): Promise<PlanEntity[]> {
    const whereConditions: Record<string, any> = {};

    const { count, rows } = await this.model.findAndCountAll({
      where: whereConditions,
      order: [['created_at', 'DESC']],
      raw: true
    });

    const plans = rows.map((plan) => new PlanEntity(plan));

    return plans;
  }
}
