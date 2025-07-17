import {
  IGetRecentCheckInsGateway,
  FindObjectivesByCompanyAndQuarterCriteria,
  FindResultKeyUpdatesCriteria
} from '../interfaces/get.recent-checkins.interface';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import { ResultKeyEntity } from '@domains/api/results-keys/entity/result-key.entity';
import { ResultKeyUpdateEntity } from '@domains/api/results-keys/entity/result-key-update.entity';
import { IObjectiveRepository } from '@domains/api/objectives/interfaces/default.interface';
import { IResultKeyRepository } from '@domains/api/results-keys/interfaces/default.interface';
import { IResultKeyUpdateRepository } from '@domains/api/results-keys/interfaces/result-key-update.interface';
import { IUserRepository } from '@domains/api/users/interfaces/default.interfaces';
import { MixGetRecentCheckInGateway } from '@adapters/gateways/api/dashboard/get.recent.checkin.gateway';
import { logger } from '@configs/logger';
import { IProfileRepository } from '@domains/api/profile/interfaces';

export interface GetRecentCheckInsGatewayDependencies {
  objectiveRepository: IObjectiveRepository;
  resultKeyRepository: IResultKeyRepository;
  resultKeyUpdateRepository: IResultKeyUpdateRepository;
  userRepository: IUserRepository;
  profileRepository: IProfileRepository;
  logging: typeof logger;
}

export class GetRecentCheckInsGateway
  extends MixGetRecentCheckInGateway
  implements IGetRecentCheckInsGateway
{
  protected objectiveRepository: IObjectiveRepository;
  protected resultKeyRepository: IResultKeyRepository;
  protected resultKeyUpdateRepository: IResultKeyUpdateRepository;
  protected userRepository: IUserRepository;
  protected profileRepository: IProfileRepository;

  constructor(params: GetRecentCheckInsGatewayDependencies) {
    super(params);
    this.objectiveRepository = params.objectiveRepository;
    this.resultKeyRepository = params.resultKeyRepository;
    this.resultKeyUpdateRepository = params.resultKeyUpdateRepository;
    this.userRepository = params.userRepository;
    this.profileRepository = params.profileRepository;
  }

  public async findObjectivesByCompanyAndQuarter(
    criteria: FindObjectivesByCompanyAndQuarterCriteria
  ): Promise<ObjectiveEntity[]> {
    return await this.objectiveRepository.findMany({
      id_company: criteria.id_company,
      quarter: criteria.quarter,
      year: criteria.year
    });
  }

  public async findResultKeysByObjectiveIds(
    objectiveIds: number[]
  ): Promise<ResultKeyEntity[]> {
    const resultKeys = await this.resultKeyRepository.findMany({
      ids_okr: objectiveIds
    });

    if (resultKeys.length) {
      return resultKeys;
    }
    return [];
  }

  public async findRecentResultKeyUpdates(
    criteria: FindResultKeyUpdatesCriteria
  ): Promise<ResultKeyUpdateEntity[]> {
    const checkIns = await this.resultKeyUpdateRepository.findMany({
      ids_result_key: criteria.resultKeyIds
    });

    console.log(checkIns);

    if (checkIns.length) {
      checkIns.slice(0, criteria.limit || 20);

      return checkIns;
    }

    return [];
  }

  public async findUserById(
    id: number
  ): Promise<{ id: number; name: string; avatar?: string } | null> {
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
    // Por enquanto retorna um time padrão
    // TODO: Implementar busca real do time do usuário quando a estrutura estiver pronta
    return { name: 'Time Geral' };
  }
}
