import { MixUpsertUserTeam } from '@adapters/gateways/api/user-teams';
import { logger } from '@configs/logger';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { IUserRepository } from '@domains/api/users/interfaces';
import {
  FindUserTeamCriteria,
  IUpsertUserTeamGateway,
  IUpsertUserTeamGatewayDependencies,
  IUserTeamRepository
} from '../interfaces';

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

    const existingUserTeam =
      await this.userTeamRepository.findIncludingSoftDeleted({
        id_user,
        id_team
      });

    if (existingUserTeam) {
      if (existingUserTeam.deleted_at) {
        this.logging.info(
          'Reativando relacionamento user-team previamente removido',
          {
            id_user,
            id_team,
            previous_deleted_at: existingUserTeam.deleted_at,
            role_in_team: role_in_team || existingUserTeam.role_in_team
          }
        );

        await this.userTeamRepository.update(
          {
            deleted_at: null,
            role_in_team: role_in_team || existingUserTeam.role_in_team
          },
          { id: existingUserTeam.id }
        );
      } else {
        if (role_in_team && role_in_team !== existingUserTeam.role_in_team) {
          this.logging.info(
            'Atualizando role do relacionamento user-team existente',
            {
              id_user,
              id_team,
              old_role: existingUserTeam.role_in_team,
              new_role: role_in_team
            }
          );

          await this.userTeamRepository.update(
            { role_in_team },
            { id: existingUserTeam.id }
          );
        } else {
          this.logging.info('Relacionamento user-team já existe e está ativo', {
            id_user,
            id_team,
            role_in_team: existingUserTeam.role_in_team
          });
        }
      }
    } else {
      const currentUserTeam = await this.userTeamRepository.find({
        id_user
      });

      if (currentUserTeam && currentUserTeam.id_team !== id_team) {
        this.logging.info('Movendo usuário de um time para outro', {
          id_user,
          old_id_team: currentUserTeam.id_team,
          new_id_team: id_team,
          role_in_team: role_in_team || 'member'
        });

        await this.userTeamRepository.update(
          { deleted_at: new Date() },
          { id: currentUserTeam.id }
        );
      }

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
