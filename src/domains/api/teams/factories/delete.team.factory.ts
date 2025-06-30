import { logger } from '@configs/logger';
import { DeleteTeamGateway } from '../gateways/delete.team.gateway';
import TeamModel from '../model/team.model';
import UserModel from '@domains/api/users/model/user.model';
import { TeamRepository } from '../repository/team.repository';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { DeleteTeamInteractor } from '../usecases';
import { Presenter } from '@protocols/presenter';
import { DeleteTeamController } from '../controllers/delete.team.controller';
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

const deleteTeamGateway = new DeleteTeamGateway(params);
const interactor = new DeleteTeamInteractor({
  gateway: deleteTeamGateway,
  presenter: new Presenter(),
  userCompanyValidator: userCompanyValidatiorInteractor
});

export const deleteTeamController = new DeleteTeamController({
  interactor
});
