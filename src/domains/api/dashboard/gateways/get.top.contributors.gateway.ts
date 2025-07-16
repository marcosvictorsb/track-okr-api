import {
  GetTopContributorsGatewayDependencies,
  IGetTopContributorsGateway,
  FindObjectivesByCompanyCriteria
} from '../interfaces/get.top.contributors.interface';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { IObjectiveRepository } from '@domains/api/objectives/interfaces';
import { IResultKeyRepository } from '@domains/api/results-keys';
import { IResultKeyUpdateRepository } from '@domains/api/results-keys/interfaces/result-key-update.interface';
import { IUserRepository } from '@domains/api/users/interfaces';
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
  resultKeyUpdateRepository: IResultKeyUpdateRepository;
  userRepository: IUserRepository;
  logging: typeof logger;

  constructor(params: GetTopContributorsGatewayDependencies) {
    super(params);
    this.teamRepository = params.teamRepository;
    this.objectiveRepository = params.objectiveRepository;
    this.resultKeyRepository = params.resultKeyRepository;
    this.resultKeyUpdateRepository = params.resultKeyUpdateRepository;
    this.userRepository = params.userRepository;
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

    // TODO: Implementar busca real do avatar na tabela profile quando disponível
    // Por enquanto retornando um avatar simulado
    return `https://api.empresa.com/avatars/user-${userId}.jpg`;
  }

  async countCheckInsByResultKeyIds(
    resultKeyIds: number[],
    startDate: Date,
    endDate: Date
  ): Promise<Map<number, number>> {
    this.logging.info('Contando check-ins por result key IDs', {
      resultKeyIds,
      startDate,
      endDate
    });

    const checkInCounts = new Map<number, number>();

    for (const resultKeyId of resultKeyIds) {
      // Buscar todas as atualizações do result key
      const allUpdates = await this.resultKeyUpdateRepository.findMany({
        id_result_key: resultKeyId
      });

      // Filtrar por período manualmente
      const filteredUpdates = allUpdates.filter((update) => {
        if (!update.created_at) return false;
        const updateDate = new Date(update.created_at);
        return updateDate >= startDate && updateDate <= endDate;
      });

      checkInCounts.set(resultKeyId, filteredUpdates.length);
    }

    return checkInCounts;
  }
}
