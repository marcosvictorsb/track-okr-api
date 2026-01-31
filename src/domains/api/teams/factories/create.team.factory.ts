import { logger } from '@configs/logger';
import UserModel from '@domains/api/users/model/user.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import {
  makeCheckCompanyFeatureLimitsInteractor,
  makeUserCompanyValidationInteractor
} from '@domains/common/validations/factories';
import { Presenter } from '@protocols/presenter';
import { CreateTeamController } from '../controllers/create.team.controller';
import { CreateTeamGateway } from '../gateways/create.team.gateway';
import TeamModel from '../model/team.model';
import { TeamRepository } from '../repository/team.repository';
import { CreateTeamInteractor } from '../usecases';

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
const createTeamGateway = new CreateTeamGateway(params);
const interactor = new CreateTeamInteractor({
  gateway: createTeamGateway,
  presenter: new Presenter(),
  userCompanyValidator: makeUserCompanyValidationInteractor(),
  checkCompanyFeatureLimits: makeCheckCompanyFeatureLimitsInteractor()
});

export const createTeamController = new CreateTeamController({
  interactor
});
