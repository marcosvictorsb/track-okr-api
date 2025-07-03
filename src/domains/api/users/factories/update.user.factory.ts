import { Presenter } from '@protocols/presenter';
import { UpdateUserController } from '../controllers/update.user.controller';
import { UpdateUserGateway } from '../gateways/update.user.gateway';
import { UpdateUserInteractor } from '../usecases/update.user.interactor';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserCompanyValidationGateway } from '@domains/common/validations/gateways/user.company.validation.gateway';
import { ManageUserTeamInteractor } from '@domains/common/user-teams/usecases';
import { ManageUserTeamGateway } from '@domains/common/user-teams/gateways';
import { UserTeamRepository } from '@domains/common/user-teams/repository/user-team.repository';
import { TeamRepository } from '@domains/api/teams/repository/team.repository';
import { logger } from '@configs/logger';
import { UserRepository } from '../repository/user.repository';
import UserModel from '../model/user.model';
import UserTeamModel from '@domains/common/user-teams/model/user-team.model';
import TeamModel from '@domains/api/teams/model/team.model';

export const makeUpdateUserController = (): UpdateUserController => {
  const userRepository = new UserRepository({ model: UserModel });
  const userTeamRepository = new UserTeamRepository({ model: UserTeamModel });
  const teamRepository = new TeamRepository({ model: TeamModel });
  const presenter = new Presenter();

  // Criar o gateway para validação
  const validationGateway = new UserCompanyValidationGateway({
    userRepository,
    logging: logger
  });

  const userCompanyValidator = new UserCompanyValidationInteractor({
    gateway: validationGateway
  });

  // Criar o gateway para update de usuário
  const gateway = new UpdateUserGateway({
    userRepository,
    logging: logger
  });

  // Criar o interactor de manage user-team
  const manageUserTeamGateway = new ManageUserTeamGateway({
    userTeamRepository,
    userRepository,
    teamRepository,
    logging: logger
  });

  const manageUserTeamInteractor = new ManageUserTeamInteractor({
    gateway: manageUserTeamGateway,
    presenter: new Presenter(),
    userCompanyValidator
  });

  const interactor = new UpdateUserInteractor({
    gateway,
    presenter,
    userCompanyValidator,
    manageUserTeamInteractor
  });

  return new UpdateUserController({ interactor });
};
