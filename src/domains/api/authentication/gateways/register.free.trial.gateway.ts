import { DataLogOutput } from '@adapters/services';
import {
  IRegisterFreeTrialGateway,
  IRegisterFreeTrialGatewayDependencies,
  CreateCompanyData
} from '../interfaces/register.free.trial.interface';
import { CompanyEntity } from '@domains/api/companies/entity/company.entity';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { ICompanyRepository } from '@domains/api/companies/interfaces';
import {
  CreateUserCriteria,
  IUserRepository
} from '@domains/api/users/interfaces';
import { ISubscriptionRepository } from '@domains/common/subscriptions/interfaces';
import { logger } from '@configs/logger';
import { IPlanRepository } from '@domains/api/backoffice/interfaces/default.interfaces';
import { PlanEntity } from '@domains/api/backoffice/entities/plan.entity';

export class RegisterGateway implements IRegisterFreeTrialGateway {
  protected companyRepository: ICompanyRepository;
  protected userRepository: IUserRepository;
  protected planRepository: IPlanRepository;
  protected subscriptionRepository: ISubscriptionRepository;
  protected logging: typeof logger;

  constructor(params: IRegisterFreeTrialGatewayDependencies) {
    this.companyRepository = params.companyRepository;
    this.userRepository = params.userRepository;
    this.planRepository = params.planRepository;
    this.subscriptionRepository = params.subscriptionRepository;
    this.logging = params.logging;
  }

  async findUserByEmail(email: string): Promise<UserEntity | undefined> {
    this.logging.info('Buscando usuário por email', { email });
    return await this.userRepository.find({ email });
  }

  async findCompanyByName(name: string): Promise<CompanyEntity | undefined> {
    this.logging.info('Buscando empresa por nome', { name });
    return await this.companyRepository.find({ name });
  }

  async findPlanByName(name: string): Promise<PlanEntity | undefined> {
    this.logging.info('Buscando plano por nome', { name_plan: name });
    return await this.planRepository.find({ name });
  }

  async createCompany(data: CreateCompanyData): Promise<CompanyEntity> {
    this.logging.info('Criando nova empresa', { data });
    return await this.companyRepository.create(data);
  }

  async createUser(data: CreateUserCriteria): Promise<UserEntity> {
    this.logging.info('Criando novo usuário', {
      name: data.name,
      email: data.email,
      role: data.role,
      id_company: data.id_company
    });
    return await this.userRepository.create(data);
  }

  // async createSubscription(
  //   data: CreateSubscriptionData
  // ): Promise<SubscriptionEntity> {
  //   return await this.subscriptionRepository.create(data);
  // }

  loggerInfo(message: string, data?: DataLogOutput): void {
    this.logging.info(message, data);
  }

  loggerError(message: string, data?: DataLogOutput): void {
    this.logging.error(message, data);
  }
}
