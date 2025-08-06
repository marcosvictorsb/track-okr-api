import {
  SubscriptionPaymentModel,
  SubscriptionPaymentAttributes,
  SubscriptionPaymentCreationAttributes
} from '../model/subscription-payment.model';
import { Op } from 'sequelize';

export interface ISubscriptionPaymentRepository {
  create(
    paymentData: SubscriptionPaymentCreationAttributes
  ): Promise<SubscriptionPaymentModel>;
  findById(id: number): Promise<SubscriptionPaymentModel | null>;
  findByEfiChargeId(
    efiChargeId: string
  ): Promise<SubscriptionPaymentModel | null>;
  findBySubscriptionId(
    subscriptionId: number
  ): Promise<SubscriptionPaymentModel[]>;
  findByCompanyId(companyId: number): Promise<SubscriptionPaymentModel[]>;
  update(
    id: number,
    paymentData: Partial<SubscriptionPaymentAttributes>
  ): Promise<SubscriptionPaymentModel | null>;
  updateByEfiChargeId(
    efiChargeId: string,
    paymentData: Partial<SubscriptionPaymentAttributes>
  ): Promise<SubscriptionPaymentModel | null>;
  findPendingPayments(): Promise<SubscriptionPaymentModel[]>;
  findOverduePayments(): Promise<SubscriptionPaymentModel[]>;
}

export class SubscriptionPaymentRepository
  implements ISubscriptionPaymentRepository
{
  async create(
    paymentData: SubscriptionPaymentCreationAttributes
  ): Promise<SubscriptionPaymentModel> {
    return await SubscriptionPaymentModel.create(paymentData);
  }

  async findById(id: number): Promise<SubscriptionPaymentModel | null> {
    return await SubscriptionPaymentModel.findByPk(id);
  }

  async findByEfiChargeId(
    efiChargeId: string
  ): Promise<SubscriptionPaymentModel | null> {
    return await SubscriptionPaymentModel.findOne({
      where: { efi_charge_id: efiChargeId }
    });
  }

  async findBySubscriptionId(
    subscriptionId: number
  ): Promise<SubscriptionPaymentModel[]> {
    return await SubscriptionPaymentModel.findAll({
      where: { subscription_id: subscriptionId },
      order: [['created_at', 'DESC']]
    });
  }

  async findByCompanyId(
    companyId: number
  ): Promise<SubscriptionPaymentModel[]> {
    return await SubscriptionPaymentModel.findAll({
      where: { company_id: companyId },
      order: [['created_at', 'DESC']]
    });
  }

  async update(
    id: number,
    paymentData: Partial<SubscriptionPaymentAttributes>
  ): Promise<SubscriptionPaymentModel | null> {
    const [affectedRows] = await SubscriptionPaymentModel.update(paymentData, {
      where: { id }
    });

    if (affectedRows === 0) {
      return null;
    }

    return await this.findById(id);
  }

  async updateByEfiChargeId(
    efiChargeId: string,
    paymentData: Partial<SubscriptionPaymentAttributes>
  ): Promise<SubscriptionPaymentModel | null> {
    const [affectedRows] = await SubscriptionPaymentModel.update(paymentData, {
      where: { efi_charge_id: efiChargeId }
    });

    if (affectedRows === 0) {
      return null;
    }

    return await this.findByEfiChargeId(efiChargeId);
  }

  async findPendingPayments(): Promise<SubscriptionPaymentModel[]> {
    return await SubscriptionPaymentModel.findAll({
      where: { status: 'pending' },
      order: [['due_date', 'ASC']]
    });
  }

  async findOverduePayments(): Promise<SubscriptionPaymentModel[]> {
    const today = new Date();

    return await SubscriptionPaymentModel.findAll({
      where: {
        status: 'pending',
        due_date: {
          [Op.lt]: today
        }
      },
      order: [['due_date', 'ASC']]
    });
  }
}
