import { MixGetRecentCheckInGateway } from '@adapters/gateways/api/dashboard/get.recent.checkin.gateway';
import { logger } from '@configs/logger';
import { CheckinsEntity } from '@domains/api/checkins/entity/checkins.entity';
import {
  FindCheckinsCriteria,
  ICheckinsRepository
} from '@domains/api/checkins/interfaces/default.interface';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import { IObjectiveRepository } from '@domains/api/objectives/interfaces/default.interface';
import { IProfileRepository } from '@domains/api/profile/interfaces';
import { ResultKeyEntity } from '@domains/api/results-keys/entity/result-key.entity';
import { IResultKeyRepository } from '@domains/api/results-keys/interfaces/default.interface';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { IUserRepository } from '@domains/api/users/interfaces/default.interfaces';
import { IUserTeamRepository } from '@domains/common/user-teams/interfaces';
import {
  FindObjectivesByCompanyAndQuarterCriteria,
  IGetRecentCheckInsGateway
} from '../interfaces/get.recent-checkins.interface';

export interface GetRecentCheckInsGatewayDependencies {
  objectiveRepository: IObjectiveRepository;
  resultKeyRepository: IResultKeyRepository;
  checkinsRepository: ICheckinsRepository;
  userRepository: IUserRepository;
  profileRepository: IProfileRepository;
  teamRepository: ITeamRepository;
  userTeamRepository: IUserTeamRepository;
  logging: typeof logger;
}

export class GetRecentCheckInsGateway
  extends MixGetRecentCheckInGateway
  implements IGetRecentCheckInsGateway
{
  protected objectiveRepository: IObjectiveRepository;
  protected resultKeyRepository: IResultKeyRepository;
  protected checkinsRepository: ICheckinsRepository;
  protected userRepository: IUserRepository;
  protected profileRepository: IProfileRepository;
  protected teamRepository: ITeamRepository;
  protected userTeamRepository: IUserTeamRepository;
  logging: typeof logger;

  constructor(params: GetRecentCheckInsGatewayDependencies) {
    super(params);
    this.objectiveRepository = params.objectiveRepository;
    this.resultKeyRepository = params.resultKeyRepository;
    this.checkinsRepository = params.checkinsRepository;
    this.userRepository = params.userRepository;
    this.profileRepository = params.profileRepository;
    this.userTeamRepository = params.userTeamRepository;
    this.teamRepository = params.teamRepository;
    this.logging = params.logging;
  }

  public async findObjectivesByCompanyAndQuarter(
    criteria: FindObjectivesByCompanyAndQuarterCriteria
  ): Promise<ObjectiveEntity[]> {
    this.logging.info('Buscando objetivos por empresa e quarter', { criteria });

    return await this.objectiveRepository.findMany({
      id_company: criteria.id_company,
      quarter: criteria.quarter,
      year: criteria.year
    });
  }

  public async findResultKeysByObjectiveIds(
    objectiveIds: number[]
  ): Promise<ResultKeyEntity[]> {
    this.logging.info('Buscando resultados-chave por IDs de objetivos', {
      objectiveIds
    });
    const resultKeys = await this.resultKeyRepository.findMany({
      ids_okr: objectiveIds
    });

    if (resultKeys.length) {
      return resultKeys;
    }
    return [];
  }

  public async findRecentCheckins(
    criteria: FindCheckinsCriteria
  ): Promise<CheckinsEntity[]> {
    this.logging.info('Buscando check-ins recentes', { criteria });

    const checkIns = await this.checkinsRepository.findMany({
      ids_result_key: criteria.ids_result_key
    });

    if (checkIns.length) {
      const sortedCheckIns = checkIns
        .sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, criteria.limit || 20);

      return sortedCheckIns;
    }

    return [];
  }

  public async findUserById(
    id: number
  ): Promise<{ id: number; name: string; avatar?: string } | null> {
    this.logging.info('Buscando usuário por ID', { id });

    const user = await this.userRepository.find({ id });
    if (!user) return null;

    const profile = await this.profileRepository.findByUserId(
      user.id as number
    );
    if (profile && profile.photo_url) {
      return {
        id: user.id!,
        name: user.name,
        avatar: profile.photo_url
      };
    }

    return {
      id: user.id!,
      name: user.name,
      avatar: ``
    };
  }

  public async findUserTeam(_userId: number): Promise<{ name: string } | null> {
    this.logging.info('Buscando time do usuário', { _userId });
    const userTeam = await this.userTeamRepository.find({ id_user: _userId });
    if (!userTeam) {
      return {
        name: 'Usuário sem time'
      };
    }
    const team = await this.teamRepository.find({ id: userTeam.id_team });
    if (team) {
      return {
        name: team.name
      };
    }
    return { name: 'Usuário sem time' };
  }
}
