import { CompanyEntity } from '@domains/api/companies/entity/company.entity';
import { ModelStatic } from 'sequelize';
import CompanyModel from '@domains/api/companies/model/company.model';

export type CreateCompanyCriteria = {
  name: string;
  cnpj: string;
};

export type FindCompanyCriteria = {
  id?: number;
  name?: string;
  cnpj?: string;
};

export type DeleteCompanyCriteria = {
  id: number;
};

export type UpdateCompanyCriteria = {
  id?: number;
  name?: string;
  cnpj?: string;
};

export interface ICompanyRepository {
  create(criteria: CreateCompanyCriteria): Promise<CompanyEntity>;
  find(
    criteria: FindCompanyCriteria
  ): Promise<CompanyEntity | undefined>;
  // findAll(criteria: FindCompanyCriteria): Promise<CompanyEntity[]>;
  update(
    criteria: UpdateCompanyCriteria,
    data: Partial<CompanyEntity>
  ): Promise<boolean>;
  delete(criteria: DeleteCompanyCriteria): Promise<boolean>;
}

export type CompanyRepositoryDependencies = {
  model: ModelStatic<CompanyModel>;
};
