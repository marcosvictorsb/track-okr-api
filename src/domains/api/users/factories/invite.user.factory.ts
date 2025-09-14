import { logger } from '@configs/logger';
import TeamModel from '@domains/api/teams/model/team.model';
import { TeamRepository } from '@domains/api/teams/repository/team.repository';
import { makeUpsertUserTeamInteractor } from '@domains/common/user-teams/factories';
import { makeUserCompanyValidationInteractor } from '@domains/common/validations/factories';
import { Presenter } from '@protocols/presenter';
import { Resend } from 'resend';
import { InviteUserController } from '../controllers/invite.user.controller';
import { InviteUserGateway } from '../gateways/invite.user.gateway';
import UserModel from '../model/user.model';
import { UserRepository } from '../repository/user.repository';
import { InviteUserInteractor } from '../usecases';

const userRepository = new UserRepository({
  model: UserModel
});

const teamRepository = new TeamRepository({
  model: TeamModel
});

const params = {
  logging: logger,
  userRepository,
  teamRepository,
  resendService: new Resend(process.env.API_KEY_RESEND as string)
};

const inviteUserGateway = new InviteUserGateway(params);
const interactor = new InviteUserInteractor({
  gateway: inviteUserGateway,
  presenter: new Presenter(),
  userCompanyValidator: makeUserCompanyValidationInteractor(),
  upsertUserTeamInteractor: makeUpsertUserTeamInteractor()
});

export const inviteUserController = new InviteUserController({
  interactor
});
