import { logger } from '@configs/logger';
import Company from '@domains/api/companies/model/company.model';
import { CompanyRepository } from '@domains/api/companies/repository/company.repository';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserCompanyValidationGateway } from '@domains/common/validations/gateways/user.company.validation.gateway';
import { Presenter } from '@protocols/presenter';
import bcrypt from 'bcryptjs';
import { ActivateUserPurchaseController } from '../controllers/activate.user.purchase.controller';
import { ActivateUserPurchaseGateway } from '../gateways/activate.user.purchase.gateway';
import UserModel from '../model/user.model';
import { UserRepository } from '../repository/user.repository';
import { ActivateUserPurchaseInteractor } from '../usecases/activate.user.purchase.interactor';

export const makeActivateUserPurchaseController =
  (): ActivateUserPurchaseController => {
    const userRepository = new UserRepository({ model: UserModel });
    const presenter = new Presenter();

    const validationGateway = new UserCompanyValidationGateway({
      userRepository,
      logging: logger
    });

    const userCompanyValidator = new UserCompanyValidationInteractor({
      gateway: validationGateway
    });

    const gateway = new ActivateUserPurchaseGateway({
      userRepository,
      companyRepository: new CompanyRepository({ model: Company }),
      logging: logger,
      bcrypt: bcrypt
    });

    const interactor = new ActivateUserPurchaseInteractor({
      gateway,
      presenter,
      userCompanyValidator
    });

    return new ActivateUserPurchaseController({ interactor });
  };
