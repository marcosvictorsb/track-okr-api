import { UserRepository } from '@domains/api/users/repository/user.repository';
import { AuthenticationGateway } from '@domains/api/authentication/gateways/get.token.gateway';
import { AuthenticationInteractor } from '@domains/api/authentication/usecases/authentication.interactor';
import UserModel from '@domains/api/users/model/user.model';
import { Presenter } from '@protocols/presenter';
import { IAuthenticationGatewayDependencies } from '@domains/api/authentication/interfaces';
import { AuthenticationController } from '@domains/api/authentication/controllers/authentication.controller';
import { logger } from '@configs/logger';

const params: IAuthenticationGatewayDependencies = {
  userRepository: new UserRepository({ model: UserModel }),
  logging: logger
};
const presenter = new Presenter();
const authenticationGateway = new AuthenticationGateway(params);
const interactor = new AuthenticationInteractor(
  authenticationGateway,
  presenter
);

export const authenticationController = new AuthenticationController({
  interactor
});
