import { HttpResponse } from '@protocols/http';
import {
  GetTeamPerformanceInteractorDependencies,
  InputGetTeamPerformance,
  IGetTeamPerformanceGateway,
  FindTeamsWithObjectivesCriteria,
  FindTeamObjectivesCriteria
} from '../interfaces/get.team.performance.interface';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import {
  TeamPerformanceEntity,
  TeamPerformanceItem,
  TrendDirection
} from '../entity/team.performance.entity';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import { OverviewEntity } from '../entity/overview.entity';
import { logger } from '@configs/logger';

export class GetTeamPerformanceInteractor {
  protected gateway: IGetTeamPerformanceGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: GetTeamPerformanceInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  public async execute(input: InputGetTeamPerformance): Promise<HttpResponse> {
    try {
      logger.info('Iniciando busca de desempenho por time', {
        requestTxt: JSON.stringify(input)
      });

      const { id_company, id_user, year, quarter } = input;

      // Validar usuário e empresa
      const isValidUser = await this.validateUserAndCompany(
        id_user,
        id_company
      );
      if (!isValidUser) {
        return this.presenter.badRequest('Usuário ou empresa inválidos');
      }

      // Buscar times da empresa
      const teams = await this.getCompanyTeams(id_company);

      // Calcular performance de cada time
      const teamsPerformance = await this.calculateTeamsPerformance(
        teams,
        id_company,
        year,
        quarter
      );

      const performanceData = new TeamPerformanceEntity({
        teams: teamsPerformance
      });

      logger.info('Desempenho por time retornado com sucesso', {
        requestTxt: `Total teams: ${teamsPerformance.length}`
      });

      return this.presenter.ok(performanceData);
    } catch (error) {
      logger.error('Erro ao buscar desempenho por time', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        requestTxt: JSON.stringify(input)
      });

      return this.presenter.serverError(
        'Erro interno do servidor ao buscar desempenho por time'
      );
    }
  }

  private async validateUserAndCompany(
    id_user: number,
    id_company: number
  ): Promise<boolean> {
    const validation = await this.userCompanyValidator.execute({
      id_user,
      id_company
    });

    if (!validation.isValid) {
      logger.info('Usuário ou empresa inválidos', {
        id_user,
        id_company
      });
      return false;
    }

    return true;
  }

  private async getCompanyTeams(id_company: number): Promise<TeamEntity[]> {
    const criteria: FindTeamsWithObjectivesCriteria = {
      id_company
    };

    return await this.gateway.findTeamsWithObjectives(criteria);
  }

  private async calculateTeamsPerformance(
    teams: TeamEntity[],
    id_company: number,
    year: number,
    quarter: number
  ): Promise<TeamPerformanceItem[]> {
    const teamsPerformance: TeamPerformanceItem[] = [];

    for (const team of teams) {
      const teamPerformance = await this.calculateSingleTeamPerformance(
        team,
        id_company,
        year,
        quarter
      );
      teamsPerformance.push(teamPerformance);
    }

    return teamsPerformance;
  }

  private async calculateSingleTeamPerformance(
    team: TeamEntity,
    id_company: number,
    year: number,
    quarter: number
  ): Promise<TeamPerformanceItem> {
    // Validar se o team tem ID válido
    if (!team.id) {
      throw new Error(`Team ${team.name} não possui ID válido`);
    }

    // Buscar objetivos do time
    const objectives = await this.getTeamObjectives(
      team.id,
      id_company,
      year,
      quarter
    );
    const objectiveIds = objectives
      .map((objective: ObjectiveEntity) => objective.id)
      .filter((id): id is number => id !== undefined);

    if (objectiveIds.length > 0) {
      const resultKeys =
        await this.gateway.findResultKeysByObjectiveIds(objectiveIds);

      // Agrupar result-keys por objetivo
      objectives.forEach((objective: ObjectiveEntity) => {
        objective.result_keys = resultKeys.filter(
          (resultKey) => resultKey.id_okr === objective.id
        );
      });
    }
    // Calcular métricas do time
    const teamMetrics = this.calculateTeamMetrics(objectives);

    // Buscar número de membros
    // const membersCount = await this.getTeamMembersCount(team.id);

    // Determinar status e trend
    const status = TeamPerformanceEntity.calculateTeamStatus(
      teamMetrics.progress
    );
    const trend = this.calculateTeamTrend(teamMetrics.progress);

    return {
      name: team.name,
      progress: teamMetrics.progress,
      objectives: teamMetrics.totalObjectives,
      keyResults: teamMetrics.totalKeyResults,
      status,
      trend
    };
  }

  private async getTeamObjectives(
    teamId: number,
    id_company: number,
    year: number,
    quarter: number
  ): Promise<ObjectiveEntity[]> {
    const criteria: FindTeamObjectivesCriteria = {
      id_company,
      id_team: teamId,
      year,
      quarter
    };

    return await this.gateway.findTeamObjectives(criteria);
  }

  private calculateTeamMetrics(objectives: ObjectiveEntity[]) {
    const totalObjectives = objectives.length;
    let totalProgress = 0;
    let totalKeyResults = 0;

    for (const objective of objectives) {
      const resultKeys = objective.result_keys || [];
      totalKeyResults += resultKeys.length;

      let objectiveProgress = 0;
      for (const kr of resultKeys) {
        const progress = OverviewEntity.calculateProgress(
          kr.current_value,
          kr.target_value
        );
        objectiveProgress += progress;
      }

      if (resultKeys.length > 0) {
        objectiveProgress = objectiveProgress / resultKeys.length;
      }

      totalProgress += objectiveProgress;
    }

    const averageProgress =
      totalObjectives > 0 ? Math.round(totalProgress / totalObjectives) : 0;

    return {
      progress: averageProgress,
      totalObjectives,
      totalKeyResults
    };
  }

  private async getTeamMembersCount(teamId: number): Promise<number> {
    return await this.gateway.findTeamMembersCount(teamId);
  }

  private calculateTeamTrend(currentProgress: number): TrendDirection {
    // TODO: Implementar comparação com período anterior quando disponível
    // Por enquanto, simular trend baseado no progresso atual
    if (currentProgress >= 80) return 'up';
    if (currentProgress >= 60) return 'stable';
    return 'down';
  }

  private getLastUpdateTime(objectives: ObjectiveEntity[]): string {
    if (objectives.length === 0) {
      return new Date().toISOString();
    }

    // Encontrar a data de atualização mais recente entre todos os objectives
    let lastUpdate = new Date(0); // Data muito antiga como fallback

    for (const objective of objectives) {
      const resultKeys = objective.result_keys || [];
      for (const kr of resultKeys) {
        if (kr.updated_at) {
          const updateDate = new Date(kr.updated_at);
          if (updateDate > lastUpdate) {
            lastUpdate = updateDate;
          }
        }
      }

      if (objective.updated_at) {
        const updateDate = new Date(objective.updated_at);
        if (updateDate > lastUpdate) {
          lastUpdate = updateDate;
        }
      }
    }

    return lastUpdate.toISOString();
  }
}
