import { logger } from '@configs/logger';
import UserModel from '@domains/api/users/model/user.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { makeUserCompanyValidationInteractor } from '@domains/common/validations/factories';
import { Presenter } from '@protocols/presenter';
import { DeleteTeamController } from '../controllers/delete.team.controller';
import { DeleteTeamGateway } from '../gateways/delete.team.gateway';
import TeamModel from '../model/team.model';
import { TeamRepository } from '../repository/team.repository';
import { DeleteTeamInteractor } from '../usecases';

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

const deleteTeamGateway = new DeleteTeamGateway(params);
const interactor = new DeleteTeamInteractor({
  gateway: deleteTeamGateway,
  presenter: new Presenter(),
  userCompanyValidator: makeUserCompanyValidationInteractor()
});

export const deleteTeamController = new DeleteTeamController({
  interactor
});
