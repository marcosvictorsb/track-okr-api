import { MixGetObjectives } from '@adapters/gateways/api/objectives';
import { logger } from '@configs/logger';
import { CheckinsEntity } from '@domains/api/checkins/entity/checkins.entity';
import {
  FindCheckinsCriteria,
  ICheckinsRepository
} from '@domains/api/checkins/interfaces';
import {
  FindObjectiveCriteria,
  IObjectiveRepository
} from '@domains/api/objectives/interfaces';
import { IProfileRepository } from '@domains/api/profile/interfaces';
import {
  FindResultKeyCriteria,
  IResultKeyRepository
} from '@domains/api/results-keys/interfaces';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { IUserRepository } from '@domains/api/users/interfaces/default.interfaces';
import {
  FilterOption,
  HistoryItem,
  KeyResultEvolution,
  KeyResultStatus,
  ObjectiveEvolution,
  ObjectiveStatus
} from '../entity/evolution.entity';
import {
  IGetEvolutionGateway,
  IGetEvolutionGatewayDependencies
} from '../interfaces/get.evolution.interface';

export class GetEvolutionGateway
  extends MixGetObjectives
  implements IGetEvolutionGateway
{
  objectiveRepository: IObjectiveRepository;
  resultKeyRepository: IResultKeyRepository;
  checkInRepository: ICheckinsRepository;
  teamRepository: ITeamRepository;
  userRepository: IUserRepository;
  profileRepository: IProfileRepository;
  logging: typeof logger;

  constructor(params: IGetEvolutionGatewayDependencies) {
    super(params);
    this.objectiveRepository = params.objectiveRepository;
    this.resultKeyRepository = params.resultKeyRepository;
    this.checkInRepository = params.checkInRepository;
    this.teamRepository = params.teamRepository;
    this.userRepository = params.userRepository;
    this.profileRepository = params.profileRepository;
    this.logging = params.logging;
  }

  public async findObjectivesByYear(
    criteria: FindObjectiveCriteria
  ): Promise<ObjectiveEvolution[]> {
    const { year, id_company, quarter } = criteria;
    this.logging.info('Finding objectives by year', {
      data: `Year: ${year}, Company: ${id_company}, Quarter: ${quarter || 'all'}`
    });

    const objectives = await this.objectiveRepository.findMany(criteria);

    const teamIds = objectives
      .map((obj) => obj.id_team)
      .filter((id): id is number => id !== undefined);

    const uniqueTeamIds = Array.from(new Set(teamIds));

    const teams = await this.teamRepository.findAll({ ids: uniqueTeamIds });

    return objectives.map((obj) => {
      const team = teams.find((t) => t.id === obj.id_team);
      return {
        id: obj.id!,
        title: obj.title,
        description: obj.description,
        team: team?.name || 'Team não encontrado',
        team_id: team?.id?.toString() || obj.id_team?.toString() || '',
        responsible_id: undefined,
        responsible_name: undefined,
        quarter: obj.quarter || 1,
        status: this.mapObjectiveStatus(obj.status),
        key_results: [],
        created_at: obj.created_at?.toISOString() || new Date().toISOString(),
        updated_at: obj.updated_at?.toISOString() || new Date().toISOString()
      };
    });
  }

  public async findKeyResultsWithCheckIns(
    criteria: FindResultKeyCriteria
  ): Promise<KeyResultEvolution[]> {
    const { ids_okr: objectiveIds } = criteria;

    this.logging.info('Encontrar resultados chaves com checkins', {
      data: `Objectives: ${(objectiveIds as number[]).join(',')}`
    });
    const keyResults = await this.resultKeyRepository.findMany({
      ids_okr: objectiveIds
    });

    return keyResults.map((kr) => ({
      id: kr.id!,
      title: kr.name,
      description: '',
      unit: kr.unit || '',
      initial_value: kr.initial_value || 0,
      target_value: kr.target_value || 0,
      current_value: kr.current_value || 0,
      progress: kr.progress_percentage || 0,
      id_okr: kr.id_okr as number,
      status: this.mapKeyResultStatus(kr.status),
      responsible_id: kr.responsible_users?.[0]?.toString(),
      responsible_name: '',
      periods: {},
      created_at: kr.created_at?.toISOString() || new Date().toISOString(),
      updated_at: kr.updated_at?.toISOString() || new Date().toISOString(),
      last_update_at: kr.updated_at?.toISOString()
    }));
  }

  public async findAvailableTeams(
    id_company: number,
    year: number
  ): Promise<FilterOption[]> {
    this.logging.info('Finding available teams', {
      data: `Company: ${id_company}, Year: ${year}`
    });

    const objectives = await this.objectiveRepository.findMany({
      id_company,
      year
    });

    const teamIds = [...new Set(objectives.map((obj) => obj.id_team))];
    const teams = await this.teamRepository.findAll({ ids: teamIds });

    return teams.map((team) => ({
      label: team.name,
      value: team.id?.toString() || '',
      count: objectives.filter((obj) => obj.id_team === team.id).length
    }));
  }

  public async findAvailableResponsibles(
    id_company: number,
    year: number
  ): Promise<FilterOption[]> {
    this.logging.info('Finding available responsibles', {
      data: `Company: ${id_company}, Year: ${year}`
    });

    return [];
  }

  public async findAvailableYears(id_company: number): Promise<number[]> {
    this.logging.info('Finding available years', {
      data: `Company: ${id_company}`
    });

    const currentYear = new Date().getFullYear();
    return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
  }

  public async findKeyResultDetail(
    kr_id: number
  ): Promise<KeyResultEvolution | null> {
    this.logging.info('Finding key result detail', {
      data: `Key Result ID: ${kr_id}`
    });

    const keyResult = await this.resultKeyRepository.findOne({ id: kr_id });

    if (!keyResult) {
      return null;
    }

    return {
      id: kr_id,
      title: keyResult.name,
      description: '',
      unit: keyResult.unit || '',
      initial_value: keyResult.initial_value || 0,
      target_value: keyResult.target_value || 0,
      current_value: keyResult.current_value || 0,
      progress: keyResult.progress_percentage || 0,
      status: this.mapKeyResultStatus(keyResult.status),
      responsible_id: keyResult.responsible_users?.[0]?.toString(),
      responsible_name: '',
      periods: {},
      created_at:
        keyResult.created_at?.toISOString() || new Date().toISOString(),
      updated_at:
        keyResult.updated_at?.toISOString() || new Date().toISOString(),
      last_update_at: keyResult.updated_at?.toISOString()
    };
  }

  public async findKeyResultHistory(
    kr_id: number,
    period: string
  ): Promise<HistoryItem[]> {
    this.logging.info('Finding key result history', {
      data: `Key Result ID: ${kr_id}, Period: ${period}`
    });

    return [
      {
        id: 1,
        value: 85000,
        comment: 'Fechamento mensal - novos contratos',
        created_at: new Date().toISOString(),
        created_by: 'Ana Silva',
        type: 'manual'
      },
      {
        id: 2,
        value: 84500,
        comment: 'Ajuste automático',
        created_at: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        created_by: 'Sistema',
        type: 'automatic'
      }
    ];
  }

  private mapKeyResultStatus(status?: string): KeyResultStatus {
    switch (status) {
      case 'completed':
        return 'completed';
      case 'on_track':
        return 'on_track';
      case 'attention':
        return 'attention';
      case 'at_risk':
        return 'at_risk';
      default:
        return 'no_data';
    }
  }

  private mapObjectiveStatus(status: string): ObjectiveStatus {
    switch (status) {
      case 'active':
        return 'active';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      case 'draft':
        return 'draft';
      default:
        return 'draft';
    }
  }

  public async findCheckInsByResultKeys(
    criteria: FindCheckinsCriteria
  ): Promise<CheckinsEntity[]> {
    this.logging.info('Buscanco check-ins por resultados chave', {
      data: `Criteria: ${JSON.stringify(criteria)}`
    });
    return await this.checkInRepository.findMany(criteria);
  }
}
