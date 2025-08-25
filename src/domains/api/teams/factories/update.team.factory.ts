import { logger } from '@configs/logger';
import { UpdateTeamGateway } from '../gateways/update.team.gateway';
import TeamModel from '../model/team.model';
import UserModel from '@domains/api/users/model/user.model';
import { TeamRepository } from '../repository/team.repository';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { UpdateTeamInteractor } from '../usecases';
import { Presenter } from '@protocols/presenter';
import { UpdateTeamController } from '../controllers/update.team.controller';
import { makeUserCompanyValidatiorInteractor } from '@domains/common/validations/factories';

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

const updateTeamGateway = new UpdateTeamGateway(params);
const interactor = new UpdateTeamInteractor({
  gateway: updateTeamGateway,
  presenter: new Presenter(),
  userCompanyValidator: makeUserCompanyValidatiorInteractor()
});

export const updateTeamController = new UpdateTeamController({
  interactor
});
