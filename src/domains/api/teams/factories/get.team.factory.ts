import { logger } from '@configs/logger';
import { GetTeamGateway } from '../gateways/get.team.gateway';
import TeamModel from '../model/team.model';
import { TeamRepository } from '../repository/team.repository';
import { GetTeamInteractor } from '../usecases';
import { Presenter } from '@protocols/presenter';
import { GetTeamController } from '../controllers/get.team.controller';
import UserModel from '@domains/api/users/model/user.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { userCompanyValidatiorInteractor } from '@domains/common/validations/factories';

const teamRepository = new TeamRepository({
  model: TeamModel
});

const userRepository = new UserRepository({
  model: UserModel
});

const params = {
  logging: logger,
  teamRepository,
  userRepository
};
const getTeamGateway = new GetTeamGateway(params);
const interactor = new GetTeamInteractor({
  gateway: getTeamGateway,
  presenter: new Presenter(),
  userCompanyValidator: userCompanyValidatiorInteractor
});

export const getTeamController = new GetTeamController({ interactor });
