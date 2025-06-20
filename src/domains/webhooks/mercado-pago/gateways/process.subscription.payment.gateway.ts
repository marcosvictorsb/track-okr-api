import {
  FindCompanyCriteria,
  ICompanyRepository,
  CreateCompanyCriteria
} from '@domains/api/companies/interfaces/';
import { CompanyEntity } from '@domains/api/companies/entity/company.entity';
import { CreateSubscriptionCriteria, ISubscriptionRepository } from '@domains/api/subscriptions/interfaces';
import { SubscriptionEntity } from '@domains/api/subscriptions/entity/subscription.entity';
import { CreateUserCriteria, IUserRepository } from '@domains/api/users/interfaces';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { IProcessSubscriptionPaymentGateway, IProcessSubscriptionPaymentGatewayDependencies } from '../interfaces/';
import { MixProcessSubscriptionPayment } from '@adapters/gateways/webhooks/process.subscription.payment.gateway';

export class ProcessSubscriptionPaymentGateway
  extends MixProcessSubscriptionPayment
  implements IProcessSubscriptionPaymentGateway
{
  companyRepository: ICompanyRepository;
  subscriptionRepository: ISubscriptionRepository;
  userRepository: IUserRepository;

  constructor(params: IProcessSubscriptionPaymentGatewayDependencies) {
    super(params);
    this.companyRepository = params.companyRepository;
    this.subscriptionRepository = params.subscriptionRepository;
    this.userRepository = params.userRepository;
  }

  async findCompany(
    criteria: FindCompanyCriteria
  ): Promise<CompanyEntity | undefined> {
    return await this.companyRepository.find(criteria);
  }

  async createCompany(
    criteria: CreateCompanyCriteria
  ): Promise<CompanyEntity | undefined> {
    return await this.companyRepository.create(criteria);
  }

  async createSubscription(
    criteria: CreateSubscriptionCriteria
  ): Promise<SubscriptionEntity | undefined> {
    return await this.subscriptionRepository.create(criteria);
  }

  async createUser(
    criteria: CreateUserCriteria
  ): Promise<UserEntity | undefined> {
    return await this.userRepository.create(criteria);
  }
}
