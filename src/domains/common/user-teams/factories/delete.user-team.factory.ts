import { Presenter } from '@protocols/presenter';
import { DeleteUserTeamGateway } from '../gateways/delete.user-team.gateway';
import { DeleteUserTeamInteractor } from '../usecases/delete.user-team.interactor';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserCompanyValidationGateway } from '@domains/common/validations/gateways/user.company.validation.gateway';
import { logger } from '@configs/logger';
import { UserTeamRepository } from '../repository/user-team.repository';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { TeamRepository } from '@domains/api/teams/repository/team.repository';
import UserTeamModel from '../model/user-team.model';
import UserModel from '@domains/api/users/model/user.model';
import TeamModel from '@domains/api/teams/model/team.model';

export const makeDeleteUserTeamInteractor = (): DeleteUserTeamInteractor => {
  const userTeamRepository = new UserTeamRepository({ model: UserTeamModel });
  const userRepository = new UserRepository({ model: UserModel });
  const teamRepository = new TeamRepository({ model: TeamModel });
  const presenter = new Presenter();

  const gateway = new DeleteUserTeamGateway({
    userTeamRepository,
    userRepository,
    teamRepository,
    logging: logger
  });

  const userCompanyValidationGateway = new UserCompanyValidationGateway({
    userRepository,
    logging: logger
  });

  const userCompanyValidator = new UserCompanyValidationInteractor({
    gateway: userCompanyValidationGateway
  });

  return new DeleteUserTeamInteractor({
    gateway,
    presenter,
    userCompanyValidator
  });
};
