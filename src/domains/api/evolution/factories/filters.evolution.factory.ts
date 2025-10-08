import { logger } from '@configs/logger';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import TeamModel from '@domains/api/teams/model/team.model';
import { TeamRepository } from '@domains/api/teams/repository/team.repository';
import UserModel from '@domains/api/users/model/user.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { makeUserCompanyValidationInteractor } from '@domains/common/validations/factories';
import { Presenter } from '@protocols/presenter';
import { FiltersEvolutionController } from '../controllers/filters.evolution.controller';
import { FiltersEvolutionGateway } from '../gateways';
import {
  FiltersEvolutionInteractorDependencies,
  IFiltersEvolutionGatewayDependencies
} from '../interfaces/filters.evolution.interface';
import { FiltersEvolutionInteractor } from '../usecases/filters.evolution.interactor';

export const makeFiltersEvolutionController = () => {
  const paramsGateway: IFiltersEvolutionGatewayDependencies = {
    objectiveRepository: new ObjectiveRepository({ model: ObjectiveModel }),
    teamRepository: new TeamRepository({ model: TeamModel }),
    userRepository: new UserRepository({ model: UserModel }),
    logging: logger
  };
  const gateway = new FiltersEvolutionGateway(paramsGateway);

  const paramsInteractor: FiltersEvolutionInteractorDependencies = {
    gateway,
    presenter: new Presenter(),
    userCompanyValidator: makeUserCompanyValidationInteractor()
  };
  const interactor = new FiltersEvolutionInteractor(paramsInteractor);

  return new FiltersEvolutionController({ interactor });
};
