import { logger } from '@configs/logger';
import { InviteUserGateway } from '../gateways/invite.user.gateway';
import UserModel from '../model/user.model';
import { UserRepository } from '../repository/user.repository';
import { InviteUserInteractor } from '../usecases';
import { Presenter } from '@protocols/presenter';
import { InviteUserController } from '../controllers/invite.user.controller';
import { userCompanyValidatiorInteractor } from '@domains/common/validations/factories';
import { TeamRepository } from '@domains/api/teams/repository/team.repository';
import TeamModel from '@domains/api/teams/model/team.model';
import { makeUpsertUserTeamInteractor } from '@domains/common/user-teams/factories';

const userRepository = new UserRepository({
  model: UserModel
});

const teamRepository = new TeamRepository({
  model: TeamModel
});

const params = {
  logging: logger,
  userRepository,
  teamRepository
};

const inviteUserGateway = new InviteUserGateway(params);
const interactor = new InviteUserInteractor({
  gateway: inviteUserGateway,
  presenter: new Presenter(),
  userCompanyValidator: userCompanyValidatiorInteractor,
  upsertUserTeamInteractor: makeUpsertUserTeamInteractor()
});

export const inviteUserController = new InviteUserController({
  interactor
});
