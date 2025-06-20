import { CompanyEntity } from "../entity/company.entity";
import { FindCompanyCriteria, ICompanyRepository } from "./default.interfaces"

export type FindCompanyGatewayDependencies = {
  companyRepository: ICompanyRepository
}


export interface IFindCompanyGateway {
  findCompany(
    criteria: FindCompanyCriteria
  ): Promise<CompanyEntity | undefined>;
}