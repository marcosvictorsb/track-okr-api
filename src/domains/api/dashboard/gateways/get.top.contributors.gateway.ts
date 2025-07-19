import {
  GetTopContributorsGatewayDependencies,
  IGetTopContributorsGateway,
  FindObjectivesByCompanyCriteria
} from '../interfaces/get.top.contributors.interface';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { IObjectiveRepository } from '@domains/api/objectives/interfaces';
import { IResultKeyRepository } from '@domains/api/results-keys';
import { ICheckinsRepository } from '@domains/api/checkins/interfaces/default.interface';
import { IUserRepository } from '@domains/api/users/interfaces';
import { IProfileRepository } from '@domains/api/profile/interfaces/default.interfaces';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import { ResultKeyEntity } from '@domains/api/results-keys/entity/result-key.entity';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { logger } from '@configs/logger';
import { MixGetTopContribuitorsGateway } from '@adapters/gateways/api/dashboard/get.top.contribuitors.gateways';

export class GetTopContributorsGateway
  extends MixGetTopContribuitorsGateway
  implements IGetTopContributorsGateway
{
  teamRepository: ITeamRepository;
  objectiveRepository: IObjectiveRepository;
  resultKeyRepository: IResultKeyRepository;
  checkinsRepository: ICheckinsRepository;
  userRepository: IUserRepository;
  profileRepository: IProfileRepository;
  logging: typeof logger;

  constructor(params: GetTopContributorsGatewayDependencies) {
    super(params);
    this.teamRepository = params.teamRepository;
    this.objectiveRepository = params.objectiveRepository;
    this.resultKeyRepository = params.resultKeyRepository;
    this.checkinsRepository = params.checkinsRepository;
    this.userRepository = params.userRepository;
    this.profileRepository = params.profileRepository;
    this.logging = params.logging;
  }

  async findObjectivesByCompany(
    criteria: FindObjectivesByCompanyCriteria
  ): Promise<ObjectiveEntity[]> {
    this.logging.info('Buscando objetivos da empresa', { criteria });

    const currentDate = new Date();
    const quarter =
      criteria.quarter || Math.ceil((currentDate.getMonth() + 1) / 3);
    const year = criteria.year || currentDate.getFullYear();

    return await this.objectiveRepository.findMany({
      id_company: criteria.id_company,
      quarter,
      year
    });
  }

  async findResultKeysByObjectiveIds(
    objectiveIds: number[]
  ): Promise<ResultKeyEntity[]> {
    this.logging.info('Buscando result keys por IDs de objetivos', {
      objectiveIds
    });

    const resultKeys: ResultKeyEntity[] = [];

    for (const objectiveId of objectiveIds) {
      const keys = await this.resultKeyRepository.findMany({
        id_okr: objectiveId
      });
      resultKeys.push(...keys);
    }

    return resultKeys;
  }

  async findUserById(userId: number): Promise<UserEntity | undefined> {
    this.logging.info('Buscando usuário por ID', { userId });

    return await this.userRepository.find({ id: userId });
  }

  async findTeamById(teamId: number): Promise<TeamEntity | undefined> {
    this.logging.info('Buscando time por ID', { teamId });

    return await this.teamRepository.find({ id: teamId });
  }

  async findUserProfileAvatar(userId: number): Promise<string | undefined> {
    this.logging.info('Buscando avatar do usuário', { userId });

    try {
      const profile = await this.profileRepository.findByUserId(userId);

      if (profile && profile.photo_url) {
        this.logging.info('Avatar encontrado para o usuário', {
          userId,
          avatar: profile.photo_url
        });
        return profile.photo_url;
      }

      this.logging.info('Avatar não encontrado para o usuário', { userId });
      return undefined;
    } catch (error) {
      this.logging.error('Erro ao buscar avatar do usuário', {
        userId,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return undefined;
    }
  }

  async countCheckInsByResultKeyIds(
    resultKeyIds: number[],
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ id_user: number; check_ins: number }>> {
    this.logging.info('Contando check-ins por result key IDs', {
      resultKeyIds,
      startDate,
      endDate
    });

    const userCheckInCounts = new Map<number, number>();

    for (const resultKeyId of resultKeyIds) {
      // Buscar todas as atualizações do result key
      const allUpdates = await this.checkinsRepository.findMany({
        id_result_key: resultKeyId
      });

      // Filtrar por período e agrupar por usuário
      for (const update of allUpdates) {
        if (!update.created_at || !update.id_user) continue;

        const updateDate = new Date(update.created_at);
        if (updateDate >= startDate && updateDate <= endDate) {
          const currentCount = userCheckInCounts.get(update.id_user) || 0;
          userCheckInCounts.set(update.id_user, currentCount + 1);
        }
      }
    }

    // Converter Map para Array
    const result = Array.from(userCheckInCounts.entries()).map(
      ([id_user, check_ins]) => ({
        id_user,
        check_ins
      })
    );

    this.logging.info('Check-ins agrupados por usuário', {
      totalUsers: result.length,
      result
    });

    return result;
  }
}
