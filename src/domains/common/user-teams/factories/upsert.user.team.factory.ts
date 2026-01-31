import { logger } from '@configs/logger';
import TeamModel from '@domains/api/teams/model/team.model';
import { TeamRepository } from '@domains/api/teams/repository/team.repository';
import UserModel from '@domains/api/users/model/user.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserCompanyValidationGateway } from '@domains/common/validations/gateways/user.company.validation.gateway';
import { Presenter } from '@protocols/presenter';
import { UpsertUserTeamGateway } from '../gateways/upsert.user.team.gateway';
import UserTeamModel from '../model/user-team.model';
import { UserTeamRepository } from '../repository/user-team.repository';
import { UpsertUserTeamInteractor } from '../usecases/upsert.user.team.interactor';

export const makeUpsertUserTeamInteractor = (): UpsertUserTeamInteractor => {
  const userTeamRepository = new UserTeamRepository({ model: UserTeamModel });
  const userRepository = new UserRepository({ model: UserModel });
  const teamRepository = new TeamRepository({ model: TeamModel });
  const presenter = new Presenter();

  const gateway = new UpsertUserTeamGateway({
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

  return new UpsertUserTeamInteractor({
    gateway,
    presenter,
    userCompanyValidator
  });
};
