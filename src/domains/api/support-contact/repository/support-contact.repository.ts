import { ModelStatic, Op } from 'sequelize';
import { SupportContactEntity } from '../entity';
import SupportContactModel from '../model/support-contact.model';
import {
  CreateSupportContactCriteria,
  DeleteSupportContactCriteria,
  FindSupportContactCriteria,
  ISupportContactRepository,
  SupportContactRepositoryDependencies,
  UpdateSupportContactCriteria
} from './support-contact.repository.interface';

export class SupportContactRepository implements ISupportContactRepository {
  protected model: ModelStatic<SupportContactModel>;

  constructor(params: SupportContactRepositoryDependencies) {
    this.model = params.model;
  }

  private getConditions(
    criteria: FindSupportContactCriteria
  ): Record<string, unknown> {
    const whereConditions: Record<string, unknown> = {};

    if (criteria.id) {
      whereConditions['id'] = criteria.id;
    }

    if (criteria.user_id) {
      whereConditions['user_id'] = criteria.user_id;
    }

    if (criteria.company_id) {
      whereConditions['company_id'] = criteria.company_id;
    }

    if (criteria.status) {
      if (Array.isArray(criteria.status)) {
        whereConditions['status'] = { [Op.in]: criteria.status };
      } else {
        whereConditions['status'] = criteria.status;
      }
    }

    if (criteria.priority) {
      if (Array.isArray(criteria.priority)) {
        whereConditions['priority'] = { [Op.in]: criteria.priority };
      } else {
        whereConditions['priority'] = criteria.priority;
      }
    }

    if (criteria.assigned_to) {
      whereConditions['assigned_to'] = criteria.assigned_to;
    }

    return whereConditions;
  }

  public async create(
    criteria: CreateSupportContactCriteria
  ): Promise<SupportContactEntity> {
    const supportContact = await this.model.create(criteria);
    return new SupportContactEntity(supportContact.dataValues);
  }

  public async find(
    criteria: FindSupportContactCriteria
  ): Promise<SupportContactEntity | undefined> {
    const supportContact = await this.model.findOne({
      where: this.getConditions(criteria),
      raw: true
    });

    if (!supportContact) return undefined;

    return new SupportContactEntity(supportContact);
  }

  public async findAll(
    criteria: FindSupportContactCriteria
  ): Promise<SupportContactEntity[]> {
    const supportContacts = await this.model.findAll({
      where: this.getConditions(criteria),
      raw: true
    });

    return supportContacts.map(
      (supportContact) => new SupportContactEntity(supportContact)
    );
  }

  public async update(
    data: Partial<UpdateSupportContactCriteria>,
    criteria: UpdateSupportContactCriteria
  ): Promise<boolean> {
    const [affectedRows] = await this.model.update(data, {
      where: { id: criteria.id }
    });

    return affectedRows > 0;
  }

  public async delete(
    criteria: DeleteSupportContactCriteria
  ): Promise<boolean> {
    const affectedRows = await this.model.destroy({
      where: { id: criteria.id }
    });

    return affectedRows > 0;
  }

  public async count(criteria: FindSupportContactCriteria): Promise<number> {
    return await this.model.count({
      where: this.getConditions(criteria)
    });
  }
}
