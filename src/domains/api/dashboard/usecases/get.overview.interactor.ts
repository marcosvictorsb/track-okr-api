import { HttpResponse } from '@protocols/http';
import {
  GetOverviewInteractorDependencies,
  InputGetOverview,
  IGetOverviewGateway
} from '../interfaces/get.overview.interface';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import {
  IOverviewEntity,
  OverviewEntity,
  OverviewStatistics,
  TrendsComparison
} from '../entity/overview.entity';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import { logger } from '@configs/logger';
import { FindTeamCriteria } from '@domains/api/teams/interfaces';
import { FindObjectiveCriteria } from '@domains/api/objectives/interfaces';

export class GetOverviewInteractor {
  protected gateway: IGetOverviewGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: GetOverviewInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  public async execute(input: InputGetOverview): Promise<HttpResponse> {
    try {
      logger.info('Iniciando a busca dos dados do  overview', {
        requestTxt: JSON.stringify(input)
      });

      const { quarter, year, team, status, id_company, id_user } = input;

      // Validar usuário e empresa
      const validation = await this.userCompanyValidator.execute({
        id_user,
        id_company
      });

      if (!validation.isValid) {
        logger.info('Usuário ou empresa inválidos', {
          id_user,
          id_company
        });
        return this.presenter.badRequest('Usuário ou empresa inválidos');
      }

      // Definir trimestre e ano atuais se não informados
      const currentDate = new Date();
      const targetYear = year || currentDate.getFullYear();
      const targetQuarter =
        quarter || Math.ceil((currentDate.getMonth() + 1) / 3);

      // Buscar time se filtro foi informado
      let teamId: number | undefined;
      if (team) {
        const teamCriteria: FindTeamCriteria = {
          name: team,
          id_company
        };
        const teamEntity = await this.gateway.findTeam(teamCriteria);
        teamId = teamEntity?.id;
      }

      // Buscar objetivos do período atual
      const objectiveCriteria: FindObjectiveCriteria = {
        id_company,
        quarter: targetQuarter,
        year: targetYear,
        id_team: teamId,
        status
      };

      const objectives = await this.gateway.findObjectives(objectiveCriteria);
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

      const overviewData = this.calculateOverview(
        objectives,
        targetQuarter,
        targetYear
      );

      logger.info(' overview retornado com sucesso', {
        requestTxt: `Quarter: ${overviewData.quarter}, Year: ${overviewData.year}, Total: ${overviewData.totalObjectives}`
      });

      return this.presenter.ok(overviewData);
    } catch (error) {
      logger.error('Erro ao buscar dados do  overview', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        requestTxt: JSON.stringify(input)
      });

      return this.presenter.serverError(
        'Erro interno do servidor ao buscar dados do '
      );
    }
  }

  private calculateOverview(
    objectives: ObjectiveEntity[],
    targetQuarter: number,
    targetYear: number
  ): IOverviewEntity {
    const objectivesMetrics = this.calculateObjectivesMetrics(objectives);
    const teamPerformance = this.calculateTeamPerformance(objectives);
    const trendsComparison = this.buildTrendsComparison(
      objectivesMetrics.avgProgress
    );
    const statistics = this.buildStatistics(objectivesMetrics, teamPerformance);

    return new OverviewEntity({
      quarter: `Q${targetQuarter}`,
      year: targetYear,
      progress: objectivesMetrics.avgProgress,
      totalObjectives: objectivesMetrics.totalObjectives,
      onTrack: objectivesMetrics.onTrack,
      atRisk: objectivesMetrics.atRisk,
      delayed: objectivesMetrics.delayed,
      completedKeyResults: objectivesMetrics.completedKeyResults,
      totalKeyResults: objectivesMetrics.totalKeyResults,
      avgTeamPerformance: teamPerformance,
      trendsComparison,
      statistics
    });
  }

  private calculateObjectivesMetrics(objectives: ObjectiveEntity[]) {
    const totalObjectives = objectives.length;
    let onTrack = 0;
    let atRisk = 0;
    let delayed = 0;
    let completedKeyResults = 0;
    let totalKeyResults = 0;
    let totalProgress = 0;

    for (const objective of objectives) {
      const objectiveMetrics = this.calculateObjectiveProgress(objective);

      totalKeyResults += objectiveMetrics.totalKeys;
      completedKeyResults += objectiveMetrics.completedKeys;
      totalProgress += objectiveMetrics.progress;

      // Categorizar por status baseado no progresso
      if (objectiveMetrics.progress >= 80) {
        onTrack++;
      } else if (objectiveMetrics.progress >= 50) {
        atRisk++;
      } else {
        delayed++;
      }
    }

    const avgProgress =
      totalObjectives > 0 ? Math.round(totalProgress / totalObjectives) : 0;

    return {
      totalObjectives,
      onTrack,
      atRisk,
      delayed,
      completedKeyResults,
      totalKeyResults,
      avgProgress
    };
  }

  private calculateObjectiveProgress(objective: ObjectiveEntity) {
    const resultKeys = objective.result_keys || [];
    const totalKeys = resultKeys.length;
    let completedKeys = 0;
    let totalProgress = 0;

    for (const kr of resultKeys) {
      const progress = OverviewEntity.calculateProgress(
        kr.current_value,
        kr.target_value
      );
      totalProgress += progress;

      if (progress >= 100) {
        completedKeys++;
      }
    }

    const objectiveProgress = totalKeys > 0 ? totalProgress / totalKeys : 0;

    return {
      progress: objectiveProgress,
      totalKeys,
      completedKeys
    };
  }

  private calculateTeamPerformance(objectives: ObjectiveEntity[]): number {
    const teamProgressMap = new Map<
      number,
      { progress: number; count: number }
    >();

    for (const objective of objectives) {
      const objectiveMetrics = this.calculateObjectiveProgress(objective);
      const teamId = objective.id_team;

      if (teamId) {
        const current = teamProgressMap.get(teamId) || {
          progress: 0,
          count: 0
        };
        teamProgressMap.set(teamId, {
          progress: current.progress + objectiveMetrics.progress,
          count: current.count + 1
        });
      }
    }

    if (teamProgressMap.size === 0) {
      return 0;
    }

    let totalTeamProgress = 0;
    for (const teamData of teamProgressMap.values()) {
      totalTeamProgress += teamData.progress / teamData.count;
    }

    return Math.round(totalTeamProgress / teamProgressMap.size);
  }

  private buildTrendsComparison(avgProgress: number): TrendsComparison {
    const previousProgress = 0; // TODO: implementar busca do período anterior

    return {
      lastQuarter: previousProgress,
      change: OverviewEntity.calculateChange(avgProgress, previousProgress)
    };
  }

  private buildStatistics(
    objectivesMetrics: ReturnType<typeof this.calculateObjectivesMetrics>,
    _teamPerformance: number
  ): OverviewStatistics {
    const previousProgress = 0; // TODO: implementar busca do período anterior

    return {
      generalProgress: {
        value: objectivesMetrics.avgProgress,
        change: OverviewEntity.calculateChange(
          objectivesMetrics.avgProgress,
          previousProgress
        ),
        trend: OverviewEntity.calculateTrend(
          objectivesMetrics.avgProgress,
          previousProgress
        )
      },
      completedOkrs: {
        value: objectivesMetrics.onTrack,
        total: objectivesMetrics.totalObjectives,
        change: 0, // TODO: calcular baseado no período anterior
        trend: 'stable'
      },
      engagement: {
        value: this.calculateEngagement(objectivesMetrics),
        change: 8, // TODO: calcular baseado no período anterior
        trend: 'up'
      },
      averageRisk: {
        value: this.calculateAverageRisk(objectivesMetrics),
        change: -3, // TODO: calcular baseado no período anterior
        trend: 'down'
      },
      averageCheckIns: 4.2, // TODO: implementar quando houver tabela de check-ins
      weeklyProgress: 8.5 // TODO: implementar baseado em histórico
    };
  }

  private calculateEngagement(
    metrics: ReturnType<typeof this.calculateObjectivesMetrics>
  ): number {
    const baseEngagement =
      (metrics.completedKeyResults / Math.max(metrics.totalKeyResults, 1)) *
      100;
    return Math.min(100, Math.round(baseEngagement + 20)); // Simulado com boost
  }

  private calculateAverageRisk(
    metrics: ReturnType<typeof this.calculateObjectivesMetrics>
  ): number {
    const riskObjectives = metrics.atRisk + metrics.delayed;
    return Math.round(
      (riskObjectives / Math.max(metrics.totalObjectives, 1)) * 100
    );
  }
}
