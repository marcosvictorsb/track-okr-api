import {
  SubscriptionPlanModel,
  SubscriptionPlanAttributes,
  SubscriptionPlanCreationAttributes
} from '@domains/api/subscription-plans/model/subscription-plan.model';

export interface ISubscriptionPlanRepository {
  create(
    planData: SubscriptionPlanCreationAttributes
  ): Promise<SubscriptionPlanModel>;
  findById(id: number): Promise<SubscriptionPlanModel | null>;
  findByEfiId(efiId: string): Promise<SubscriptionPlanModel | null>;
  findAll(isActive?: boolean): Promise<SubscriptionPlanModel[]>;
  update(
    id: number,
    planData: Partial<SubscriptionPlanAttributes>
  ): Promise<SubscriptionPlanModel | null>;
  delete(id: number): Promise<boolean>;
}

export class SubscriptionPlanRepository implements ISubscriptionPlanRepository {
  async create(
    planData: SubscriptionPlanCreationAttributes
  ): Promise<SubscriptionPlanModel> {
    return await SubscriptionPlanModel.create(planData);
  }

  async findById(id: number): Promise<SubscriptionPlanModel | null> {
    return await SubscriptionPlanModel.findByPk(id);
  }

  async findByEfiId(efiId: string): Promise<SubscriptionPlanModel | null> {
    return await SubscriptionPlanModel.findOne({
      where: { efi_plan_id: efiId }
    });
  }

  async findAll(isActive?: boolean): Promise<SubscriptionPlanModel[]> {
    const whereClause = isActive !== undefined ? { is_active: isActive } : {};

    return await SubscriptionPlanModel.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });
  }

  async update(
    id: number,
    planData: Partial<SubscriptionPlanAttributes>
  ): Promise<SubscriptionPlanModel | null> {
    const [affectedRows] = await SubscriptionPlanModel.update(planData, {
      where: { id }
    });

    if (affectedRows === 0) {
      return null;
    }

    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const affectedRows = await SubscriptionPlanModel.destroy({
      where: { id }
    });

    return affectedRows > 0;
  }
}
