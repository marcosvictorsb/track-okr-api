import { DataLogOutput } from "@adapters/services";
import { logger } from "@configs/logger";
import { CompanyEntity } from "@domains/api/companies/entity/company.entity";
import { CreateCompanyCriteria, FindCompanyCriteria, ICompanyRepository } from "@domains/api/companies/interfaces";
import { SubscriptionEntity } from "@domains/api/subscriptions/entity/subscription.entity";
import { CreateSubscriptionCriteria, ISubscriptionRepository } from "@domains/api/subscriptions/interfaces";
import { UserEntity } from "@domains/api/users/entity/user.entity";
import { CreateUserCriteria, IUserRepository } from "@domains/api/users/interfaces";
import { sequelize } from '@infra/database/connection/mysql';

export interface IProcessSubscriptionPaymentGateway {
  findCompany(
    criteria: FindCompanyCriteria
  ): Promise<CompanyEntity | undefined>;
  createCompany(
    criteria: CreateCompanyCriteria
  ): Promise<CompanyEntity | undefined>;
  createSubscription(
    criteria: CreateSubscriptionCriteria
  ): Promise<SubscriptionEntity | undefined>;
  createUser(criteria: CreateUserCriteria): Promise<UserEntity | undefined>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
  sendEmail(subject: string, to: string, emailContent: string): Promise<void>;

  // startTransaction(): Promise<Transaction>;
  // commitTransaction(transaction: Transaction): Promise<void>;
  // rollbackTransaction(transaction: Transaction): Promise<void>;
}

export type IProcessSubscriptionPaymentGatewayDependencies = {
  companyRepository: ICompanyRepository;
  subscriptionRepository: ISubscriptionRepository;
  userRepository: IUserRepository;
  logging: typeof logger;
  sequelize: typeof sequelize;
}