import {
  PlanModel,
  PlanAttributes,
  PlanCreationAttributes
} from '@domains/api/plans/model/plan.model';

export interface IPlanRepository {
  create(planData: PlanCreationAttributes): Promise<PlanModel>;
  findById(id: number): Promise<PlanModel | null>;
  findByEfiId(efiId: string): Promise<PlanModel | null>;
  findAll(isActive?: boolean): Promise<PlanModel[]>;
  update(
    id: number,
    planData: Partial<PlanAttributes>
  ): Promise<PlanModel | null>;
  delete(id: number): Promise<boolean>;
}

export class PlanRepository implements IPlanRepository {
  async create(planData: PlanCreationAttributes): Promise<PlanModel> {
    return await PlanModel.create(planData);
  }

  async findById(id: number): Promise<PlanModel | null> {
    return await PlanModel.findByPk(id);
  }

  async findByEfiId(efiId: string): Promise<PlanModel | null> {
    return await PlanModel.findOne({
      where: { efi_plan_id: efiId }
    });
  }

  async findAll(isActive?: boolean): Promise<PlanModel[]> {
    const whereClause = isActive !== undefined ? { is_active: isActive } : {};

    return await PlanModel.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });
  }

  async update(
    id: number,
    planData: Partial<PlanAttributes>
  ): Promise<PlanModel | null> {
    const [affectedRows] = await PlanModel.update(planData, {
      where: { id }
    });

    if (affectedRows === 0) {
      return null;
    }

    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const affectedRows = await PlanModel.destroy({
      where: { id }
    });

    return affectedRows > 0;
  }
}
