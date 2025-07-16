import { GetDashboardOverviewController } from '../controllers/get.dashboard.overview.controller';
import { GetDashboardOverviewInteractor } from '../usecases/get.dashboard.overview.interactor';
import { GetDashboardOverviewGateway } from '../gateways/get.dashboard.overview.gateway';
import { Presenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserCompanyValidationGateway } from '@domains/common/validations/gateways/user.company.validation.gateway';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { TeamRepository } from '@domains/api/teams/repository/team.repository';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import { ResultKeyRepository } from '@domains/api/results-keys/repository/result-key.repository';
import UserModel from '@domains/api/users/model/user.model';
import TeamModel from '@domains/api/teams/model/team.model';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import ResultKeyModel from '@domains/api/results-keys/model/result-key.model';
import { logger } from '@configs/logger';

export const makeGetDashboardOverviewController =
  (): GetDashboardOverviewController => {
    const presenter = new Presenter();

    // Criar repositórios
    const userRepository = new UserRepository({ model: UserModel });
    const teamRepository = new TeamRepository({ model: TeamModel });
    const objectiveRepository = new ObjectiveRepository({
      model: ObjectiveModel
    });
    const resultKeyRepository = new ResultKeyRepository({
      model: ResultKeyModel
    });

    // Criar o gateway para validação
    const validationGateway = new UserCompanyValidationGateway({
      userRepository,
      logging: logger
    });

    const userCompanyValidator = new UserCompanyValidationInteractor({
      gateway: validationGateway
    });

    const gateway = new GetDashboardOverviewGateway({
      teamRepository,
      objectiveRepository,
      resultKeyRepository,
      logging: logger
    });

    const interactor = new GetDashboardOverviewInteractor({
      gateway,
      presenter,
      userCompanyValidator
    });

    return new GetDashboardOverviewController({
      interactor
    });
  };
