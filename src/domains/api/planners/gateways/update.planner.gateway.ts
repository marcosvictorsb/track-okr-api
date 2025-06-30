import { PlannerEntity } from '../entity/planner.entity';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  FindPlannerCriteria,
  IPlannerRepository,
  UpdatePlannerCriteria
} from '../interfaces';
import {
  IUserRepository,
  FindUserCriteria
} from '@domains/api/users/interfaces/default.interfaces';
import {
  IUpdatePlannerGateway,
  IUpdatePlannerGatewayDependencies
} from '../interfaces/update.planner.interface';
import { MixUpdatePlanner } from '@adapters/gateways/api/planners';
import { logger } from '@configs/logger';

export class UpdatePlannerGateway
  extends MixUpdatePlanner
  implements IUpdatePlannerGateway
{
  plannerRepository: IPlannerRepository;
  userRepository: IUserRepository;
  logging: typeof logger;

  constructor(params: IUpdatePlannerGatewayDependencies) {
    super(params);
    this.plannerRepository = params.plannerRepository;
    this.userRepository = params.userRepository;
    this.logging = params.logging;
  }

  async findPlanner(
    criteria: FindPlannerCriteria
  ): Promise<PlannerEntity | undefined> {
    this.logging.info('Buscando o planejamento', { criteria });
    return await this.plannerRepository.find(criteria);
  }

  async updatePlanner(
    data: Partial<PlannerEntity>,
    criteria: UpdatePlannerCriteria
  ): Promise<boolean> {
    this.logging.info('Atualizando o planejamento', {
      criteria,
      data
    });
    return await this.plannerRepository.update(data, criteria);
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    this.logging.info('Iniciando busca do usuário', { criteria });
    return await this.userRepository.find(criteria);
  }
}
