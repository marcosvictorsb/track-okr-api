import { HttpResponse } from '@protocols/http';
import {
  GetDashboardOverviewInteractorDependencies,
  InputGetDashboardOverview,
  IGetDashboardOverviewGateway,
  FindDashboardObjectiveCriteria,
  FindDashboardTeamCriteria
} from '../interfaces/get.dashboard-overview.interface';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import {
  IDashboardOverviewEntity,
  DashboardOverviewEntity,
  TrendsComparison,
  DashboardStatistics
} from '../entity/dashboard-overview.entity';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';

export class GetDashboardOverviewInteractor {
  protected gateway: IGetDashboardOverviewGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: GetDashboardOverviewInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  public async execute(
    input: InputGetDashboardOverview
  ): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo(
        'Iniciando a busca dos dados do dashboard overview',
        {
          requestTxt: JSON.stringify(input)
        }
      );

      const { quarter, year, team, status, id_company, id_user } = input;

      // Validar usuário e empresa
      const validation = await this.userCompanyValidator.execute({
        id_user,
        id_company
      });

      if (!validation.isValid) {
        this.gateway.loggerInfo('Usuário ou empresa inválidos', {
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
        const teamCriteria: FindDashboardTeamCriteria = {
          name: team,
          id_company
        };
        const teamEntity = await this.gateway.findTeam(teamCriteria);
        teamId = teamEntity?.id;
      }

      // Buscar objetivos do período atual
      const objectiveCriteria: FindDashboardObjectiveCriteria = {
        id_company,
        quarter: targetQuarter,
        year: targetYear,
        id_team: teamId,
        status
      };

      const objectives = await this.gateway.findObjectives(objectiveCriteria);

      // Buscar objetivos do período anterior
      const previousQuarter = targetQuarter === 1 ? 4 : targetQuarter - 1;
      const previousYear = targetQuarter === 1 ? targetYear - 1 : targetYear;

      // const previousObjectiveCriteria: FindDashboardObjectiveCriteria = {
      //   id_company,
      //   quarter: previousQuarter,
      //   year: previousYear
      // };

      // const previousObjectives = await this.gateway.findPreviousObjectives(
      //   previousObjectiveCriteria
      // );

      const overviewData = this.calculateDashboardOverview(
        objectives,
        //previousObjectives,
        targetQuarter,
        targetYear
      );

      this.gateway.loggerInfo('Dashboard overview retornado com sucesso', {
        requestTxt: `Quarter: ${overviewData.quarter}, Year: ${overviewData.year}, Total: ${overviewData.totalObjectives}`
      });

      return this.presenter.ok(overviewData);
    } catch (error) {
      this.gateway.loggerError('Erro ao buscar dados do dashboard overview', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        requestTxt: JSON.stringify(input)
      });

      return this.presenter.serverError(
        'Erro interno do servidor ao buscar dados do dashboard'
      );
    }
  }

  private calculateDashboardOverview(
    objectives: ObjectiveEntity[],
    // previousObjectives?: ObjectiveEntity[],
    targetQuarter: number,
    targetYear: number
  ): IDashboardOverviewEntity {
    const totalObjectives = objectives.length;

    // Categorizar objectives por status baseado no progresso
    let onTrack = 0;
    let atRisk = 0;
    let delayed = 0;
    let completedKeyResults = 0;
    let totalKeyResults = 0;
    let totalProgress = 0;

    const teamProgressMap = new Map<
      number,
      { progress: number; count: number }
    >();

    for (const objective of objectives) {
      const resultKeys = objective.result_keys || [];
      totalKeyResults += resultKeys.length;

      let objectiveProgress = 0;
      let completedCount = 0;

      // Calcular progresso do objetivo baseado nas key results
      for (const kr of resultKeys) {
        const progress = DashboardOverviewEntity.calculateProgress(
          kr.current_value,
          kr.target_value
        );
        objectiveProgress += progress;

        if (progress >= 100) {
          completedCount++;
        }
      }

      completedKeyResults += completedCount;

      if (resultKeys.length > 0) {
        objectiveProgress = objectiveProgress / resultKeys.length;
      }

      totalProgress += objectiveProgress;

      // Categorizar por status
      if (objectiveProgress >= 80) {
        onTrack++;
      } else if (objectiveProgress >= 50) {
        atRisk++;
      } else {
        delayed++;
      }

      // Agrupar por time para calcular performance média
      const teamId = objective.id_team;
      if (teamId) {
        const current = teamProgressMap.get(teamId) || {
          progress: 0,
          count: 0
        };
        teamProgressMap.set(teamId, {
          progress: current.progress + objectiveProgress,
          count: current.count + 1
        });
      }
    }

    const avgProgress =
      totalObjectives > 0 ? Math.round(totalProgress / totalObjectives) : 0;

    // Calcular performance média dos times
    let avgTeamPerformance = 0;
    if (teamProgressMap.size > 0) {
      let totalTeamProgress = 0;
      for (const teamData of teamProgressMap.values()) {
        totalTeamProgress += teamData.progress / teamData.count;
      }
      avgTeamPerformance = Math.round(totalTeamProgress / teamProgressMap.size);
    }

    // Calcular progresso do trimestre anterior
    const previousProgress = 0;
    // if (previousObjectives.length > 0) {
    //   let totalPrevProgress = 0;
    //   for (const obj of previousObjectives) {
    //     const resultKeys = obj.result_keys || [];
    //     let objProgress = 0;
    //     for (const kr of resultKeys) {
    //       objProgress += DashboardOverviewEntity.calculateProgress(
    //         kr.current_value,
    //         kr.target_value
    //       );
    //     }
    //     if (resultKeys.length > 0) {
    //       objProgress = objProgress / resultKeys.length;
    //     }
    //     totalPrevProgress += objProgress;
    //   }
    //   previousProgress = Math.round(
    //     totalPrevProgress / previousObjectives.length
    //   );
    // }

    // Construir response seguindo a estrutura esperada
    const trendsComparison: TrendsComparison = {
      lastQuarter: previousProgress,
      change: DashboardOverviewEntity.calculateChange(
        avgProgress,
        previousProgress
      )
    };

    const statistics: DashboardStatistics = {
      generalProgress: {
        value: avgProgress,
        change: DashboardOverviewEntity.calculateChange(
          avgProgress,
          previousProgress
        ),
        trend: DashboardOverviewEntity.calculateTrend(
          avgProgress,
          previousProgress
        )
      },
      completedOkrs: {
        value: onTrack,
        total: totalObjectives,
        change: 0, // TODO: calcular baseado no período anterior
        trend: 'stable'
      },
      engagement: {
        value: Math.min(
          100,
          Math.round(
            (completedKeyResults / Math.max(totalKeyResults, 1)) * 100 + 20
          )
        ), // Simulado
        change: 8,
        trend: 'up'
      },
      averageRisk: {
        value: Math.round(
          ((atRisk + delayed) / Math.max(totalObjectives, 1)) * 100
        ),
        change: -3,
        trend: 'down'
      },
      averageCheckIns: 4.2, // TODO: implementar quando houver tabela de check-ins
      weeklyProgress: 8.5 // TODO: implementar baseado em histórico
    };

    const quarterName = `Q${targetQuarter}`;

    return new DashboardOverviewEntity({
      quarter: quarterName,
      year: targetYear,
      progress: avgProgress,
      totalObjectives,
      onTrack,
      atRisk,
      delayed,
      completedKeyResults,
      totalKeyResults,
      avgTeamPerformance,
      trendsComparison,
      statistics
    });
  }
}
