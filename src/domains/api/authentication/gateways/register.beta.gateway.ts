import { MixRegisterGateway } from '@adapters/gateways/api/authentication/register.free.trial.gateway';
import { logger } from '@configs/logger';
import { PlanEntity } from '@domains/api/backoffice/entities/plan.entity';
import { IPlanRepository } from '@domains/api/backoffice/interfaces/default.interfaces';
import { CompanyEntity } from '@domains/api/companies/entity/company.entity';
import { ICompanyRepository } from '@domains/api/companies/interfaces';
import { FindPlannerCriteria } from '@domains/api/planners/interfaces';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  CreateUserCriteria,
  IUserRepository
} from '@domains/api/users/interfaces';
import { ISubscriptionRepository } from '@domains/common/subscriptions/interfaces';
import crypto from 'crypto';
import {
  CreateBetaCompanyData,
  IRegisterBetaGateway,
  IRegisterBetaGatewayDependencies
} from '../interfaces/register.beta.interface';

export class RegisterBetaGateway
  extends MixRegisterGateway
  implements IRegisterBetaGateway
{
  companyRepository: ICompanyRepository;
  userRepository: IUserRepository;
  planRepository: IPlanRepository;
  subscriptionRepository: ISubscriptionRepository;
  logging: typeof logger;

  constructor(params: IRegisterBetaGatewayDependencies) {
    super(params);
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

  async findPlanByName(
    criteria: FindPlannerCriteria
  ): Promise<PlanEntity | undefined> {
    this.logging.info('Buscando plano por nome', { criteria });
    return await this.planRepository.find(criteria);
  }

  async createCompany(data: CreateBetaCompanyData): Promise<CompanyEntity> {
    this.logging.info('Criando nova empresa beta', { data });
    return await this.companyRepository.create(data);
  }

  async createUser(data: CreateUserCriteria): Promise<UserEntity> {
    this.logging.info('Criando novo usuário beta', {
      name: data.name,
      email: data.email,
      role: data.role,
      id_company: data.id_company
    });
    return await this.userRepository.create(data);
  }

  async generateActivationToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    this.logging.info('Token de ativação gerado para beta tester', {
      userId,
      token
    });

    return token;
  }
}
