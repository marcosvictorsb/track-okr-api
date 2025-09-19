import { MixInformationGateway } from '@adapters/gateways/api/information';
import { logger } from '@configs/logger';
import { UserTeamEntity } from '@domains/common/user-teams/entity/user-team.entity';
import {
  FindUserTeamCriteria,
  IUserTeamRepository
} from '@domains/common/user-teams/interfaces';
import {
  IGetInformationGateway,
  IGetPlannerGatewayDependencies
} from '../interfaces';

export class GetInformationGateway
  extends MixInformationGateway
  implements IGetInformationGateway
{
  logging: typeof logger;
  userTeamRepository: IUserTeamRepository;

  constructor(params: IGetPlannerGatewayDependencies) {
    super(params);
    this.logging = params.logging;
    this.userTeamRepository = params.userTeamRepository;
  }

  async findUserTeam(
    criteria: FindUserTeamCriteria
  ): Promise<UserTeamEntity | undefined> {
    this.logging.info('Buscando o time do usuário', { criteria });
    return this.userTeamRepository.find(criteria);
  }
}
