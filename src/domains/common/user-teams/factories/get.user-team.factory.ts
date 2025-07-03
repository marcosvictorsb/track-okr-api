import { Presenter } from '@protocols/presenter';
import { GetUserTeamGateway } from '../gateways/get.user-team.gateway';
import { GetUserTeamInteractor } from '../usecases/get.user-team.interactor';
import { logger } from '@configs/logger';
import { UserTeamRepository } from '../repository/user-team.repository';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { TeamRepository } from '@domains/api/teams/repository/team.repository';
import UserTeamModel from '../model/user-team.model';
import UserModel from '@domains/api/users/model/user.model';
import TeamModel from '@domains/api/teams/model/team.model';

export const makeGetUserTeamInteractor = (): GetUserTeamInteractor => {
  const userTeamRepository = new UserTeamRepository({ model: UserTeamModel });
  const userRepository = new UserRepository({ model: UserModel });
  const teamRepository = new TeamRepository({ model: TeamModel });
  const presenter = new Presenter();

  const gateway = new GetUserTeamGateway({
    userTeamRepository,
    userRepository,
    teamRepository,
    logging: logger
  });

  return new GetUserTeamInteractor({
    gateway,
    presenter
  });
};
