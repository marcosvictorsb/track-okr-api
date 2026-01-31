import { MixActivateUserPurchase } from '@adapters/gateways/api/users';
import { logger } from '@configs/logger';
import { CompanyEntity } from '@domains/api/companies/entity/company.entity';
import {
  FindCompanyCriteria,
  ICompanyRepository
} from '@domains/api/companies/interfaces';
import { UserEntity } from '../entity/user.entity';
import {
  FindUserCriteria,
  IUserRepository,
  UpdateUserCriteria
} from '../interfaces';
import {
  IActivateUserPurchaseGateway,
  IActivateUserPurchaseGatewayDependencies
} from '../interfaces/activate.user.purchase.interface';

export class ActivateUserPurchaseGateway
  extends MixActivateUserPurchase
  implements IActivateUserPurchaseGateway
{
  userRepository: IUserRepository;
  logging: typeof logger;
  companyRepository: ICompanyRepository;

  constructor(params: IActivateUserPurchaseGatewayDependencies) {
    super(params);
    this.userRepository = params.userRepository;
    this.logging = params.logging;
    this.companyRepository = params.companyRepository;
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    this.logging.info('Iniciando busca do usuário', { criteria });
    return await this.userRepository.find(criteria);
  }

  async updateUser(
    data: Partial<UpdateUserCriteria>,
    criteria: UpdateUserCriteria
  ): Promise<boolean> {
    this.logging.info('Atualizando o usuário', { criteria });
    return await this.userRepository.update(data, criteria);
  }

  async findCompany(
    criteria: FindCompanyCriteria
  ): Promise<CompanyEntity | undefined> {
    this.logging.info('Iniciando busca da empresa', { criteria });
    return await this.companyRepository.find(criteria);
  }

  async updateCompany(
    data: Partial<CompanyEntity>,
    criteria: FindCompanyCriteria
  ): Promise<boolean> {
    this.logging.info('Atualizando a empresa', { criteria });
    return await this.companyRepository.update(data, criteria);
  }
}
