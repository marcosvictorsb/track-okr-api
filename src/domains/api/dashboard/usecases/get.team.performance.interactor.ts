import { logger } from '@configs/logger';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { OverviewEntity } from '../entity/overview.entity';
import {
  TeamPerformanceEntity,
  TeamPerformanceItem,
  TrendDirection
} from '../entity/team.performance.entity';
import {
  FindTeamObjectivesCriteria,
  FindTeamsWithObjectivesCriteria,
  GetTeamPerformanceInteractorDependencies,
  IGetTeamPerformanceGateway,
  InputGetTeamPerformance
} from '../interfaces/get.team.performance.interface';

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

      const isValidUser = await this.validateUserAndCompany(
        id_user,
        id_company
      );
      if (!isValidUser) {
        return this.presenter.badRequest('Usuário ou empresa inválidos');
      }

      const teams = await this.getCompanyTeams(id_company);

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
    if (!team.id) {
      throw new Error(`Team ${team.name} não possui ID válido`);
    }

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

      objectives.forEach((objective: ObjectiveEntity) => {
        objective.result_keys = resultKeys.filter(
          (resultKey) => resultKey.id_okr === objective.id
        );
      });
    }
    const teamMetrics = this.calculateTeamMetrics(objectives);

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

  private calculateTeamTrend(currentProgress: number): TrendDirection {
    if (currentProgress >= 80) return 'up';
    if (currentProgress >= 60) return 'stable';
    return 'down';
  }
}
