import {
  IUpsertUserTeamGateway,
  IUpsertUserTeamGatewayDependencies,
  FindUserTeamCriteria,
  IUserTeamRepository
} from '../interfaces';
import { IUserRepository } from '@domains/api/users/interfaces';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { MixUpsertUserTeam } from '@adapters/gateways/api/user-teams';
import { logger } from '@configs/logger';

export class UpsertUserTeamGateway
  extends MixUpsertUserTeam
  implements IUpsertUserTeamGateway
{
  userTeamRepository: IUserTeamRepository;
  userRepository: IUserRepository;
  teamRepository: ITeamRepository;
  logging: typeof logger;

  constructor(params: IUpsertUserTeamGatewayDependencies) {
    super(params);
    this.userTeamRepository = params.userTeamRepository;
    this.userRepository = params.userRepository;
    this.teamRepository = params.teamRepository;
    this.logging = params.logging;
  }

  async upsertUserTeam(criteria: FindUserTeamCriteria): Promise<void> {
    const { id_user, id_team, role_in_team } = criteria;

    const userTeam = await this.userTeamRepository.find({
      id_user
    });
    const isDifferentTeam = userTeam && userTeam.id_team !== id_team;
    if (isDifferentTeam) {
      this.logging.info(
        'Atualizando relacionamento de usuário com time existente',
        {
          id_user,
          old_id_team: userTeam.id_team,
          new_id_team: id_team,
          role_in_team: role_in_team || userTeam.role_in_team
        }
      );
      await this.userTeamRepository.update(
        { id_team: id_team as number },
        { id: userTeam.id }
      );
    } else {
      this.logging.info('Criando novo relacionamento de usuário com time', {
        id_user,
        id_team,
        role_in_team: role_in_team || 'member'
      });
      await this.userTeamRepository.create({
        id_team: id_team as number,
        id_user: id_user as number,
        role_in_team: role_in_team || 'member'
      });
    }
  }
}
