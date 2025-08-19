import { logger } from '@configs/logger';
import { RecurringPaymentGatewayDependencies } from '../interfaces/recurring.payment.interfaces';
import { RecurringPaymentGateway } from '../gateways/recurring.payment.gateway';
import { RecurringPaymentInteractor } from '../usecases/recurring.payment.interactor';
import { Presenter } from '@protocols/presenter';
import { RecurringPaymentController } from '../controllers/recurring.payment.controller';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import UserModel from '@domains/api/users/model/user.model';
import { CompanyRepository } from '@domains/api/companies/repository/company.repository';
import Company from '@domains/api/companies/model/company.model';
import { PlanRepository } from '@domains/api/backoffice/repository/plan.repository';
import { PlanModel } from '@domains/api/backoffice/models/plan.model';
import { SubscriptionRepository } from '@domains/common/subscriptions/repository/subscription.repository';
import SubscriptionModel from '@domains/common/subscriptions/model/subscription.model';

export const makeRecurringPaymentController = () => {
  const gateway: RecurringPaymentGatewayDependencies = {
    logging: logger,
    userRepository: new UserRepository({ model: UserModel }),
    companyRepository: new CompanyRepository({ model: Company }),
    planRepository: new PlanRepository({ model: PlanModel }),
    subscriptionRepository: new SubscriptionRepository({
      model: SubscriptionModel
    })
  };

  const recurringPaymentGateway = new RecurringPaymentGateway(gateway);
  const interactor = new RecurringPaymentInteractor({
    gateway: recurringPaymentGateway,
    presenter: new Presenter()
  });

  return new RecurringPaymentController({ interactor });
};
