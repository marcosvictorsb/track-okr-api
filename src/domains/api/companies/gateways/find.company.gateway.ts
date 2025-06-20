import {
  FindCompanyCriteria,
  FindCompanyGatewayDependencies,
  IFindCompanyGateway,
  ICompanyRepository
} from '@domains/api/companies/interfaces/';
import { MixFindCompany } from '@adapters/gateways/companies';
import { CompanyEntity } from '@domains/api/companies/entity/company.entity';

export class FindCompanyGateway
  extends MixFindCompany
  implements IFindCompanyGateway
{
  companyRepository: ICompanyRepository;

  constructor(params: FindCompanyGatewayDependencies) {
    super(params);
    this.companyRepository = params.companyRepository;
  }

  async findCompany(
    criteria: FindCompanyCriteria
  ): Promise<CompanyEntity | undefined> {
    return await this.companyRepository.find(criteria);
  }
}
