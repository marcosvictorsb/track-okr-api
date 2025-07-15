import { Op, WhereOptions } from 'sequelize';
import { LandingPageLeadEntity } from '../entity/landing-page-lead.entity';
import LandingPageLeadModel from '../model/landing-page-lead.model';
import {
  ILandingPageLeadRepository,
  CreateLandingPageLeadData,
  UpdateLandingPageLeadData,
  FindLandingPageLeadCriteria
} from '../interfaces/landing-page-lead.repository.interface';

export class LandingPageLeadRepository implements ILandingPageLeadRepository {
  private modelToEntity(model: LandingPageLeadModel): LandingPageLeadEntity {
    return new LandingPageLeadEntity({
      id: model.id,
      name: model.name,
      email: model.email,
      company: model.company,
      position: model.position,
      company_size: model.company_size,
      source: model.source,
      page_url: model.page_url,
      user_agent: model.user_agent,
      ip_address: model.ip_address,
      utm_source: model.utm_source,
      utm_medium: model.utm_medium,
      utm_campaign: model.utm_campaign,
      utm_term: model.utm_term,
      utm_content: model.utm_content,
      status: model.status,
      notes: model.notes,
      contacted_at: model.contacted_at,
      converted_at: model.converted_at,
      created_at: model.created_at,
      updated_at: model.updated_at,
      deleted_at: model.deleted_at
    });
  }

  private buildWhereClause(
    criteria: FindLandingPageLeadCriteria
  ): WhereOptions {
    const where: WhereOptions = {};

    if (criteria.id) {
      where.id = criteria.id;
    }

    if (criteria.email) {
      where.email = criteria.email;
    }

    if (criteria.company) {
      where.company = {
        [Op.like]: `%${criteria.company}%`
      };
    }

    if (criteria.status) {
      where.status = criteria.status;
    }

    if (criteria.source) {
      where.source = criteria.source;
    }

    if (criteria.company_size) {
      where.company_size = criteria.company_size;
    }

    if (criteria.utm_source) {
      where.utm_source = criteria.utm_source;
    }

    if (criteria.utm_medium) {
      where.utm_medium = criteria.utm_medium;
    }

    if (criteria.utm_campaign) {
      where.utm_campaign = criteria.utm_campaign;
    }

    if (criteria.created_after || criteria.created_before) {
      const dateConditions: Record<symbol, Date> = {};
      if (criteria.created_after) {
        dateConditions[Op.gte] = criteria.created_after;
      }
      if (criteria.created_before) {
        dateConditions[Op.lte] = criteria.created_before;
      }
      where.created_at = dateConditions;
    }

    return where;
  }

  async create(
    data: CreateLandingPageLeadData
  ): Promise<LandingPageLeadEntity> {
    const model = await LandingPageLeadModel.create({
      ...data,
      source: data.source || 'landing-page',
      status: 'new'
    });
    return this.modelToEntity(model);
  }

  async findById(id: number): Promise<LandingPageLeadEntity | null> {
    const model = await LandingPageLeadModel.findByPk(id);
    return model ? this.modelToEntity(model) : null;
  }

  async findByEmail(email: string): Promise<LandingPageLeadEntity | null> {
    const model = await LandingPageLeadModel.findOne({
      where: { email }
    });
    return model ? this.modelToEntity(model) : null;
  }

  async findAll(
    criteria: FindLandingPageLeadCriteria = {}
  ): Promise<LandingPageLeadEntity[]> {
    const where = this.buildWhereClause(criteria);

    const options: {
      where: WhereOptions;
      order: [string, string][];
      limit?: number;
      offset?: number;
    } = {
      where,
      order: [['created_at', 'DESC']]
    };

    if (criteria.limit) {
      options.limit = criteria.limit;
    }

    if (criteria.offset) {
      options.offset = criteria.offset;
    }

    const models = await LandingPageLeadModel.findAll(options);
    return models.map((model) => this.modelToEntity(model));
  }

  async update(
    id: number,
    data: UpdateLandingPageLeadData
  ): Promise<LandingPageLeadEntity | null> {
    const model = await LandingPageLeadModel.findByPk(id);
    if (!model) {
      return null;
    }

    await model.update(data);
    return this.modelToEntity(model);
  }

  async delete(id: number): Promise<boolean> {
    const model = await LandingPageLeadModel.findByPk(id);
    if (!model) {
      return false;
    }

    await model.destroy();
    return true;
  }

  async count(criteria: FindLandingPageLeadCriteria = {}): Promise<number> {
    const where = this.buildWhereClause(criteria);
    return await LandingPageLeadModel.count({ where });
  }

  async findDuplicateByEmailAndCompany(
    email: string,
    company?: string
  ): Promise<LandingPageLeadEntity | null> {
    const where: WhereOptions = { email };

    if (company) {
      where.company = company;
    }

    const model = await LandingPageLeadModel.findOne({
      where,
      order: [['created_at', 'DESC']]
    });

    return model ? this.modelToEntity(model) : null;
  }
}
