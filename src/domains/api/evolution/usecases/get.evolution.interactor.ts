import { CheckinsEntity } from '@domains/api/checkins/entity/checkins.entity';
import {
  GetEvolutionInteractorDependencies,
  IGetEvolutionGateway,
  InputGetEvolution
} from '@domains/api/evolution/interfaces/get.evolution.interface';
import { FindObjectiveCriteria } from '@domains/api/objectives/interfaces';
import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  EvolutionResponse,
  GranularityType,
  KeyResultEvolution,
  KeyResultStatus,
  PeriodData
} from '../entity/evolution.entity';

export class GetEvolutionInteractor {
  protected gateway: IGetEvolutionGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: GetEvolutionInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  public async execute(input: InputGetEvolution): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Iniciando busca de evolução de OKRs', {
        requestTxt: JSON.stringify(input)
      });

      const {
        year,
        granularity,
        teams,
        responsibles: _responsibles,
        quarter,
        id_company,
        id_user
      } = input;

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

      const criteria: FindObjectiveCriteria = {
        year,
        id_company,
        ...(quarter && { quarter }),
        ...(teams?.length && { id_team: Number(teams) })
      };
      const objectives = await this.gateway.findObjectivesByYear(criteria);

      if (!objectives || objectives.length === 0) {
        this.gateway.loggerInfo(
          'Nenhum objetivo encontrado para o ano especificado'
        );
        return this.presenter.ok({
          objectives: [],
          periods: this.generatePeriods(granularity),
          filters: {
            available_teams: [],
            available_responsibles: [],
            available_years: []
          },
          metadata: {
            total_objectives: 0,
            total_key_results: 0,
            generated_at: new Date().toISOString(),
            granularity,
            year
          }
        });
      }

      const objectiveIds = objectives
        .map((obj) => obj.id)
        .filter((id): id is number => id !== undefined);

      let keyResults: KeyResultEvolution[] = [];
      keyResults = await this.gateway.findKeyResultsWithCheckIns({
        ids_okr: objectiveIds
      });

      if (!keyResults || keyResults.length === 0) {
        this.gateway.loggerInfo(
          'Nenhum key result encontrado para os objetivos especificados'
        );
        return this.presenter.ok({
          objectives,
          periods: this.generatePeriods(granularity),
          filters: {
            available_teams: [],
            available_responsibles: [],
            available_years: []
          },
          metadata: {
            total_objectives: 0,
            total_key_results: 0,
            generated_at: new Date().toISOString(),
            granularity,
            year
          }
        });
      }

      const idsResultKeys = keyResults
        .map((kr) => kr.id)
        .filter((id): id is number => id !== undefined);

      const checkins = await this.gateway.findCheckInsByResultKeys({
        ids_result_key: idsResultKeys
      });

      keyResults.forEach((kr) => {
        kr.checkins = checkins.filter((ci) => ci.id_result_key === kr.id);
      });

      objectives.forEach((objective) => {
        objective.key_results = keyResults.filter(
          (kr) => kr.id_okr === objective.id
        );
      });

      objectives.forEach((objective) => {
        objective.key_results.forEach((kr) => {
          kr.periods = this.processKeyResultPeriods(kr, granularity, year);
        });
      });

      const response: EvolutionResponse = {
        objectives,
        periods: this.generatePeriods(granularity),
        metadata: {
          total_objectives: objectives.length,
          total_key_results: keyResults.length,
          generated_at: new Date().toISOString(),
          granularity,
          year
        }
      };

      this.gateway.loggerInfo('Evolução de OKRs encontrada com sucesso');
      return this.presenter.ok(response);
    } catch (error) {
      this.gateway.loggerError('Erro ao buscar evolução de OKRs', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        id_company: input.id_company
      });
      return this.presenter.serverError('Erro ao buscar evolução de OKRs');
    }
  }

  private generatePeriods(granularity: GranularityType): string[] {
    if (granularity === 'monthly') {
      return [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro'
      ];
    } else {
      // weekly - futuro
      const weeks: string[] = [];
      for (let i = 1; i <= 52; i++) {
        weeks.push(`S${i.toString().padStart(2, '0')}`);
      }
      return weeks;
    }
  }

  private processKeyResultPeriods(
    keyResult: KeyResultEvolution,
    granularity: GranularityType,
    year: number
  ): PeriodData {
    const periods: PeriodData = {};
    const periodNames = this.generatePeriods(granularity);

    periodNames.forEach((period) => {
      periods[period] = null;
    });

    if (keyResult.checkins && keyResult.checkins.length > 0) {
      if (granularity === 'monthly') {
        const checkinsByMonth = this.groupCheckinsByMonth(
          keyResult.checkins,
          year
        );

        for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
          const period = periodNames[monthIndex];
          const monthCheckins = checkinsByMonth[monthIndex];

          if (monthCheckins && monthCheckins.length > 0) {
            let lastCheckin = monthCheckins[0];
            for (let i = 1; i < monthCheckins.length; i++) {
              const c = monthCheckins[i];
              const idC = typeof c.id === 'number' ? c.id : Number(c.id) || 0;
              const idLast =
                typeof lastCheckin.id === 'number'
                  ? lastCheckin.id
                  : Number(lastCheckin.id) || 0;
              if (idC > idLast) lastCheckin = c;
            }
            const currentValue = lastCheckin.new_value;

            const progress = this.calculateProgress(
              currentValue,
              keyResult.initial_value,
              keyResult.target_value
            );

            periods[period] = {
              progress: Math.min(Math.max(progress, 0), 100),

              status: this.calculateStatus(progress, monthIndex + 1, 12),
              current_value: currentValue,
              updated_at:
                lastCheckin.created_at?.toISOString() ||
                new Date().toISOString(),
              update_count: monthCheckins.length,
              has_manual_update: true
            };
          } else {
            periods[period] = {
              progress: 0,

              status: 'no_data',
              current_value: 0,
              updated_at: new Date(year, monthIndex, 1).toISOString(),
              update_count: 0,
              has_manual_update: false
            };
          }
        }
      } else if (granularity === 'weekly') {
        // Lógica para granularidade semanal - futuro
      }
    }

    return periods;
  }

  private groupCheckinsByMonth(
    checkins: CheckinsEntity[],
    year: number
  ): CheckinsEntity[][] {
    const months: CheckinsEntity[][] = Array.from({ length: 12 }, () => []);

    checkins.forEach((checkin) => {
      if (checkin.created_at) {
        const checkinDate = new Date(checkin.created_at);

        if (checkinDate.getFullYear() === year) {
          const monthIndex = checkinDate.getMonth();
          months[monthIndex].push(checkin);
        }
      }
    });

    months.forEach((monthCheckins) => {
      monthCheckins.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (dateA !== dateB) return dateA - dateB;
        const idA = typeof a.id === 'number' ? a.id : 0;
        const idB = typeof b.id === 'number' ? b.id : 0;
        return idA - idB;
      });
    });

    return months;
  }

  private calculateProgress(
    currentValue: number,
    initialValue: number,
    targetValue: number
  ): number {
    if (targetValue === initialValue) return 0;

    if (targetValue > initialValue) {
      return (
        ((currentValue - initialValue) / (targetValue - initialValue)) * 100
      );
    } else {
      return (
        ((initialValue - currentValue) / (initialValue - targetValue)) * 100
      );
    }
  }

  private calculateStatus(
    progress: number,
    periodNumber: number,
    totalPeriods: number
  ): KeyResultStatus {
    const expectedProgress = (periodNumber / totalPeriods) * 100;

    if (progress >= 100) return 'completed';
    if (progress >= expectedProgress * 0.9) return 'on_track';
    if (progress >= expectedProgress * 0.6) return 'attention';
    return 'at_risk';
  }
}
