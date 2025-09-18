import { CompanyEntity } from '@domains/api/companies/entity/company.entity';
import {
  CompanyRepositoryDependencies,
  CreateCompanyCriteria,
  DeleteCompanyCriteria,
  FindCompanyCriteria,
  ICompanyRepository,
  UpdateCompanyCriteria
} from '@domains/api/companies/interfaces';
import CompanyModel from '@domains/api/companies/model/company.model';
import { ModelStatic } from 'sequelize';

export class CompanyRepository implements ICompanyRepository {
  protected model: ModelStatic<CompanyModel>;

  constructor(params: CompanyRepositoryDependencies) {
    this.model = params.model;
  }

  private getConditions(
    criteria: FindCompanyCriteria
  ): Record<string, unknown> {
    const whereConditions: Record<string, unknown> = {};

    if (criteria.id) {
      whereConditions['id'] = criteria.id;
    }

    if (criteria.cnpj) {
      whereConditions['cnpj'] = criteria.cnpj;
    }

    if (criteria.name) {
      whereConditions['name'] = criteria.name;
    }

    if (criteria.website) {
      whereConditions['website'] = criteria.website;
    }

    return whereConditions;
  }

  public async create(data: CreateCompanyCriteria): Promise<CompanyEntity> {
    const company = await this.model.create(data);
    return new CompanyEntity(company.dataValues);
  }

  public async find(
    criteria: FindCompanyCriteria
  ): Promise<CompanyEntity | undefined> {
    const company = await this.model.findOne({
      where: this.getConditions(criteria),
      raw: true
    });

    if (!company) return undefined;

    return new CompanyEntity(company);
  }

  public async findAll(
    criteria: FindCompanyCriteria
  ): Promise<CompanyEntity[]> {
    const companies = await this.model.findAll({
      where: this.getConditions(criteria),
      attributes: {
        exclude: ['password_hash']
      },
      raw: true
    });

    if (!companies || companies.length === 0) return [];

    return companies.map((company: CompanyModel) => new CompanyEntity(company));
  }

  public async update(
    data: Partial<UpdateCompanyCriteria>,
    criteria: UpdateCompanyCriteria
  ): Promise<boolean> {
    const [affectedRows] = await this.model.update(data, {
      where: this.getConditions(criteria)
    });
    if (affectedRows === 0) return false;
    return true;
  }

  public async delete(criteria: DeleteCompanyCriteria): Promise<boolean> {
    const affectedRows = await this.model.destroy({
      where: { id: criteria.id }
    });
    return affectedRows > 0;
  }
}
