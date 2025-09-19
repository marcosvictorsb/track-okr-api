import { logger } from '@configs/logger';
import UserTeamModel from '@domains/common/user-teams/model/user-team.model';
import { UserTeamRepository } from '@domains/common/user-teams/repository/user-team.repository';
import { makeUserCompanyValidationInteractor } from '@domains/common/validations/factories';
import { Presenter } from '@protocols/presenter';
import { GetInformationController } from '../controllers';
import { GetInformationGateway } from '../gateways';
import { IGetPlannerGatewayDependencies } from '../interfaces';
import { GetInformationInteractor } from '../usecases';

const params: IGetPlannerGatewayDependencies = {
  logging: logger,
  userTeamRepository: new UserTeamRepository({ model: UserTeamModel })
};
const gateway = new GetInformationGateway(params);
const interactor = new GetInformationInteractor({
  gateway,
  presenter: new Presenter(),
  userCompanyValidator: makeUserCompanyValidationInteractor()
});

export const getInformationController = new GetInformationController({
  interactor
});
