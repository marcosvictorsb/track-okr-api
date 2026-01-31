import { CheckinsEntity } from '@domains/api/checkins/entity/checkins.entity';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import { ResultKeyEntity } from '@domains/api/results-keys';
import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  GetTemporalEvolutionInteractorDependencies,
  IGetTemporalEvolutionGateway,
  InputGetTemporalEvolution
} from '../interfaces/get.temporal.evolution.interface';

export class GetTemporalEvolutionInteractor {
  protected gateway: IGetTemporalEvolutionGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: GetTemporalEvolutionInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  public async execute(
    input: InputGetTemporalEvolution
  ): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Iniciando busca de evolução temporal', {
        requestTxt: JSON.stringify(input)
      });

      const {
        id_company,
        id_user,
        quarter,
        year,
        period: _period = 'monthly'
      } = input;

      const isValidUser = await this.validateUserAndCompany(
        id_user,
        id_company
      );

      if (!isValidUser) {
        return this.presenter.badRequest('Usuário ou empresa inválidos');
      }

      if (quarter === 5) {
        return await this.handleYearlyEvolution(id_company, year);
      }

      const idObjectiveIds = await this.getIdObjectiveIds(
        id_company,
        quarter,
        year
      );

      if (idObjectiveIds.length === 0) {
        this.gateway.loggerInfo(
          'Nenhum objetivo encontrado para a empresa no quarter',
          {
            id_company,
            quarter,
            year
          }
        );

        return this.presenter.ok({
          currentQuarter: new Array(12).fill(0),
          cumulativeQuarter: new Array(12).fill(0)
        });
      }

      const resultKeys =
        await this.gateway.findResultKeysByObjectiveIds(idObjectiveIds);

      const resultKeyIds = this.getResultKeyIds(resultKeys);

      const checkins = await this.gateway.findCheckinsByIds({ resultKeyIds });
      const months = this.getQuarterMonths(quarter);
      const percetualEvolutionWeekly = [
        // PRIMEIRO MÊS
        this.getPercetualEvolutionWeekly(
          resultKeys,
          resultKeyIds,
          checkins,
          new Date(year, months[0], 1),
          new Date(year, months[0], 7)
        ),
        this.getPercetualEvolutionWeekly(
          resultKeys,
          resultKeyIds,
          checkins,
          new Date(year, months[0], 8),
          new Date(year, months[0], 14)
        ),
        this.getPercetualEvolutionWeekly(
          resultKeys,
          resultKeyIds,
          checkins,
          new Date(year, months[0], 15),
          new Date(year, months[0], 21)
        ),
        this.getPercetualEvolutionWeekly(
          resultKeys,
          resultKeyIds,
          checkins,
          new Date(year, months[0], 22),
          this.getLastDayOfMonth(year, months[0])
        ),

        // SEGUNDO MÊS
        this.getPercetualEvolutionWeekly(
          resultKeys,
          resultKeyIds,
          checkins,
          new Date(year, months[1], 1),
          new Date(year, months[1], 7)
        ),
        this.getPercetualEvolutionWeekly(
          resultKeys,
          resultKeyIds,
          checkins,
          new Date(year, months[1], 8),
          new Date(year, months[1], 14)
        ),
        this.getPercetualEvolutionWeekly(
          resultKeys,
          resultKeyIds,
          checkins,
          new Date(year, months[1], 15),
          new Date(year, months[1], 21)
        ),
        this.getPercetualEvolutionWeekly(
          resultKeys,
          resultKeyIds,
          checkins,
          new Date(year, months[1], 22),
          this.getLastDayOfMonth(year, months[1])
        ),

        // TERCEIRO MÊS
        this.getPercetualEvolutionWeekly(
          resultKeys,
          resultKeyIds,
          checkins,
          new Date(year, months[2], 1),
          new Date(year, months[2], 7)
        ),
        this.getPercetualEvolutionWeekly(
          resultKeys,
          resultKeyIds,
          checkins,
          new Date(year, months[2], 8),
          new Date(year, months[2], 14)
        ),
        this.getPercetualEvolutionWeekly(
          resultKeys,
          resultKeyIds,
          checkins,
          new Date(year, months[2], 15),
          new Date(year, months[2], 21)
        ),
        this.getPercetualEvolutionWeekly(
          resultKeys,
          resultKeyIds,
          checkins,
          new Date(year, months[2], 22),
          this.getLastDayOfMonth(year, months[2])
        )
      ];

      const cumulativeQuarter = await this.calculateCumulativeProgress(
        resultKeys,
        checkins,
        year,
        quarter,
        id_company
      );

      return this.presenter.ok({
        currentQuarter: percetualEvolutionWeekly,
        cumulativeQuarter: cumulativeQuarter
      });
    } catch (error) {
      this.gateway.loggerError('Erro ao buscar evolução temporal', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        requestTxt: JSON.stringify(input)
      });

      return this.presenter.serverError(
        'Erro interno do servidor ao buscar evolução temporal'
      );
    }
  }

  private async handleYearlyEvolution(
    id_company: number,
    year: number
  ): Promise<HttpResponse> {
    this.gateway.loggerInfo('Processando evolução temporal anual (quarter 5)', {
      id_company,
      year
    });

    const allObjectives = await this.gateway.findObjectivesByCompanyAndQuarter({
      id_company,
      year,
      quarter: undefined
    } as unknown as Parameters<
      typeof this.gateway.findObjectivesByCompanyAndQuarter
    >[0]);

    if (allObjectives.length === 0) {
      this.gateway.loggerInfo('Nenhum objetivo encontrado para o ano', {
        id_company,
        year
      });

      return this.presenter.ok({
        currentQuarter: new Array(12).fill(0),
        cumulativeQuarter: new Array(12).fill(0)
      });
    }

    const objectiveIds = allObjectives
      .map((obj: ObjectiveEntity) => obj.id)
      .filter((id): id is number => id !== undefined);

    const resultKeys =
      await this.gateway.findResultKeysByObjectiveIds(objectiveIds);
    const resultKeyIds = this.getResultKeyIds(resultKeys);
    const checkins = await this.gateway.findCheckinsByIds({ resultKeyIds });

    const monthlyEvolution = await this.calculateYearlyMonthlyEvolution(
      resultKeys,
      checkins,
      year,
      id_company
    );

    const cumulativeMonthly = await this.calculateYearlyCumulativeProgress(
      resultKeys,
      checkins,
      year,
      id_company
    );

    return this.presenter.ok({
      currentQuarter: monthlyEvolution,
      cumulativeQuarter: cumulativeMonthly
    });
  }

  private getLastDayOfMonth(year: number, month: number): Date {
    return new Date(year, month + 1, 0);
  }

  private getPercetualEvolutionWeekly(
    resultKeys: ResultKeyEntity[],
    resultKeyIds: number[],
    checkins: CheckinsEntity[],
    startDateWeek: Date,
    endDateWeek: Date
  ): number {
    this.gateway.loggerInfo('Calculando evolução semanal', {
      startDateWeek: startDateWeek.toISOString(),
      endDateWeek: endDateWeek.toISOString()
    });

    const checkinsInWeek = checkins.filter((checkin) => {
      const checkinDate = new Date(checkin.created_at as Date);
      return checkinDate >= startDateWeek && checkinDate <= endDateWeek;
    });

    if (checkinsInWeek.length === 0) {
      this.gateway.loggerInfo('Nenhum checkin encontrado na semana', {
        startDateWeek: startDateWeek.toISOString(),
        endDateWeek: endDateWeek.toISOString()
      });
      return 0;
    }

    let totalWeeklyProgress = 0;
    let resultKeysWithProgress = 0;

    resultKeyIds.forEach((resultKeyId) => {
      const resultKey = resultKeys.find((rk) => rk.id === resultKeyId);
      if (!resultKey) return;

      const resultKeyCheckins = checkinsInWeek.filter(
        (checkin) => checkin.id_result_key === resultKeyId
      );

      if (resultKeyCheckins.length === 0) return;

      const minPreviousValue = Math.min(
        ...resultKeyCheckins.map((checkin) =>
          parseFloat(checkin.previous_value?.toString() || '0')
        )
      );

      const maxNewValue = Math.max(
        ...resultKeyCheckins.map((checkin) =>
          parseFloat(checkin.new_value?.toString() || '0')
        )
      );

      const weeklyEvolution = maxNewValue - minPreviousValue;

      const targetValue = parseFloat(resultKey.target_value?.toString() || '0');
      const initialValue = parseFloat(
        resultKey.initial_value?.toString() || '0'
      );

      if (targetValue > initialValue) {
        const totalGoal = targetValue - initialValue;
        const weeklyProgressPercentage = (weeklyEvolution / totalGoal) * 100;

        const validProgress = Math.max(weeklyProgressPercentage, 0);

        totalWeeklyProgress += validProgress;
        resultKeysWithProgress++;

        this.gateway.loggerInfo('Progresso calculado para result key', {
          id_result_key: resultKeyId,
          minPreviousValue,
          maxNewValue,
          weeklyEvolution,
          targetValue,
          initialValue,
          weeklyProgressPercentage: validProgress
        });
      }
    });

    const averageWeeklyProgress =
      resultKeysWithProgress > 0
        ? totalWeeklyProgress / resultKeysWithProgress
        : 0;

    this.gateway.loggerInfo('Evolução semanal calculada', {
      startDateWeek: startDateWeek.toISOString(),
      endDateWeek: endDateWeek.toISOString(),
      totalWeeklyProgress,
      resultKeysWithProgress,
      averageWeeklyProgress: Math.round(averageWeeklyProgress)
    });

    return Math.round(averageWeeklyProgress);
  }

  private getResultKeyIds(resultKeys: ResultKeyEntity[]): number[] {
    return resultKeys
      .map((rk: ResultKeyEntity) => rk.id)
      .filter((id): id is number => id !== undefined);
  }

  private async getIdObjectiveIds(
    id_company: number,
    quarter: number,
    year: number
  ): Promise<number[]> {
    const criteria: {
      id_company: number;
      year: number;
      quarter?: number;
    } = {
      id_company,
      year: year as number
    };

    if (quarter !== 5) {
      criteria.quarter = quarter as number;
    }

    const objectives = await this.gateway.findObjectivesByCompanyAndQuarter(
      criteria as unknown as Parameters<
        typeof this.gateway.findObjectivesByCompanyAndQuarter
      >[0]
    );

    return objectives
      .map((obj: ObjectiveEntity) => obj.id)
      .filter((id): id is number => id !== undefined);
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
      this.gateway.loggerInfo('Usuário ou empresa inválidos', {
        id_user,
        id_company
      });
      return false;
    }

    return true;
  }

  private async calculateCumulativeProgress(
    resultKeys: ResultKeyEntity[],
    checkins: CheckinsEntity[],
    year: number,
    quarter: number,
    id_company: number
  ): Promise<number[]> {
    const months = this.getQuarterMonths(quarter);
    const cumulativeProgress = new Array(12).fill(0);

    const allObjectives = await this.gateway.findObjectivesByCompanyAndQuarter({
      id_company,
      quarter,
      year
    });

    const resultKeysByObjective = new Map<number, ResultKeyEntity[]>();

    allObjectives.forEach((objective) => {
      if (objective.id) {
        resultKeysByObjective.set(objective.id, []);
      }
    });

    resultKeys.forEach((rk) => {
      if (rk.id_okr && resultKeysByObjective.has(rk.id_okr)) {
        resultKeysByObjective.get(rk.id_okr)!.push(rk);
      }
    });

    for (let monthIndex = 0; monthIndex < 3; monthIndex++) {
      const month = months[monthIndex];

      const weeks = [
        { start: new Date(year, month, 1), end: new Date(year, month, 7) },
        { start: new Date(year, month, 8), end: new Date(year, month, 14) },
        { start: new Date(year, month, 15), end: new Date(year, month, 21) },
        {
          start: new Date(year, month, 22),
          end: this.getLastDayOfMonth(year, month)
        }
      ];

      weeks.forEach((week, weekIndex) => {
        const globalWeekIndex = monthIndex * 4 + weekIndex;
        const currentDate = new Date();

        const isLastWeekOfQuarter = globalWeekIndex === 11;
        const isCurrentOrFutureWeek =
          week.end >= currentDate || isLastWeekOfQuarter;

        let totalObjectivesProgress = 0;
        let validObjectivesCount = 0;

        resultKeysByObjective.forEach((objectiveResultKeys, objectiveId) => {
          let totalResultKeyProgress = 0;
          let validResultKeysCount = 0;

          objectiveResultKeys.forEach((resultKey) => {
            const targetValue = parseFloat(
              resultKey.target_value?.toString() || '0'
            );
            const initialValue = parseFloat(
              resultKey.initial_value?.toString() || '0'
            );

            if (targetValue !== 0 && resultKey.id) {
              let currentValue = initialValue;

              if (isCurrentOrFutureWeek || isLastWeekOfQuarter) {
                currentValue = parseFloat(
                  resultKey.current_value?.toString() || initialValue.toString()
                );

                this.gateway.loggerInfo('Usando current_value da result key', {
                  data: `Semana ${globalWeekIndex} - RK ${resultKey.id}: usando current_value ${currentValue} (isLastWeek: ${isLastWeekOfQuarter})`
                });
              } else {
                const relevantCheckins = checkins
                  .filter(
                    (checkin) =>
                      checkin.id_result_key === resultKey.id &&
                      new Date(checkin.created_at as Date) <= week.end
                  )
                  .sort(
                    (a, b) =>
                      new Date(b.created_at as Date).getTime() -
                      new Date(a.created_at as Date).getTime()
                  );

                if (relevantCheckins.length > 0) {
                  const latestCheckin = relevantCheckins[0];
                  currentValue = parseFloat(
                    latestCheckin.new_value?.toString() ||
                      initialValue.toString()
                  );

                  this.gateway.loggerInfo(
                    'Usando checkin para semana passada',
                    {
                      data: `Semana ${globalWeekIndex} - RK ${resultKey.id}: usando checkin ${currentValue} de ${latestCheckin.created_at}`
                    }
                  );
                }
              }

              let progress = 0;
              if (targetValue > initialValue) {
                progress =
                  ((currentValue - initialValue) /
                    (targetValue - initialValue)) *
                  100;
              } else if (targetValue < initialValue) {
                progress =
                  ((initialValue - currentValue) /
                    (initialValue - targetValue)) *
                  100;
              } else if (
                targetValue === initialValue &&
                currentValue >= targetValue
              ) {
                progress = 100;
              }

              const clampedProgress = Math.min(Math.max(progress, 0), 100);
              totalResultKeyProgress += clampedProgress;
              validResultKeysCount++;

              this.gateway.loggerInfo('Progresso acumulado da result key', {
                data: `Semana ${globalWeekIndex} - RK ${resultKey.id}: ${initialValue} -> ${currentValue}/${targetValue} = ${clampedProgress.toFixed(1)}% (Objetivo ${objectiveId})`
              });
            }
          });

          if (validResultKeysCount > 0) {
            const objectiveAverage =
              totalResultKeyProgress / validResultKeysCount;
            totalObjectivesProgress += objectiveAverage;

            this.gateway.loggerInfo('Progresso do objetivo', {
              data: `Semana ${globalWeekIndex} - Objetivo ${objectiveId}: ${objectiveAverage.toFixed(1)}% (${validResultKeysCount} RKs)`
            });
          } else {
            totalObjectivesProgress += 0;

            this.gateway.loggerInfo('Objetivo sem result keys válidas', {
              data: `Semana ${globalWeekIndex} - Objetivo ${objectiveId}: 0% (sem RKs válidas)`
            });
          }

          validObjectivesCount++;
        });

        const averageProgress =
          validObjectivesCount > 0
            ? totalObjectivesProgress / validObjectivesCount
            : 0;

        cumulativeProgress[globalWeekIndex] = Math.round(averageProgress);

        this.gateway.loggerInfo('Progresso acumulado da semana', {
          data: `Semana ${globalWeekIndex} (${week.end.toISOString().substring(0, 10)}): ${Math.round(averageProgress)}% - Total objetivos: ${totalObjectivesProgress.toFixed(1)} / ${validObjectivesCount} objetivos`
        });
      });
    }

    return cumulativeProgress;
  }

  private getQuarterMonths(quarter: number): number[] {
    switch (quarter) {
      case 1:
        return [0, 1, 2]; // Jan, Fev, Mar
      case 2:
        return [3, 4, 5]; // Abr, Mai, Jun
      case 3:
        return [6, 7, 8]; // Jul, Ago, Set
      case 4:
        return [9, 10, 11]; // Out, Nov, Dez
      case 5:
        return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // Ano todo: Jan - Dez
      default:
        return [];
    }
  }

  private async calculateYearlyMonthlyEvolution(
    resultKeys: ResultKeyEntity[],
    checkins: CheckinsEntity[],
    year: number,
    _id_company: number
  ): Promise<number[]> {
    const monthlyEvolution = new Array(12).fill(0);
    const resultKeyIds = this.getResultKeyIds(resultKeys);

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);
      const endDate = this.getLastDayOfMonth(year, month);

      const monthProgress = this.getPercetualEvolutionWeekly(
        resultKeys,
        resultKeyIds,
        checkins,
        startDate,
        endDate
      );

      monthlyEvolution[month] = monthProgress;

      this.gateway.loggerInfo('Evolução mensal calculada', {
        data: `Mês ${month + 1}/${year}: ${monthProgress}%`
      });
    }

    return monthlyEvolution;
  }

  private async calculateYearlyCumulativeProgress(
    resultKeys: ResultKeyEntity[],
    checkins: CheckinsEntity[],
    year: number,
    id_company: number
  ): Promise<number[]> {
    const cumulativeProgress = new Array(12).fill(0);

    const allObjectives = await this.gateway.findObjectivesByCompanyAndQuarter({
      id_company,
      year,
      quarter: undefined
    } as unknown as Parameters<
      typeof this.gateway.findObjectivesByCompanyAndQuarter
    >[0]);

    const resultKeysByObjective = new Map<number, ResultKeyEntity[]>();

    allObjectives.forEach((objective) => {
      if (objective.id) {
        resultKeysByObjective.set(objective.id, []);
      }
    });

    resultKeys.forEach((rk) => {
      if (rk.id_okr && resultKeysByObjective.has(rk.id_okr)) {
        resultKeysByObjective.get(rk.id_okr)!.push(rk);
      }
    });

    for (let month = 0; month < 12; month++) {
      const endOfMonth = this.getLastDayOfMonth(year, month);
      const currentDate = new Date();
      const isCurrentOrFutureMonth = endOfMonth >= currentDate;

      let totalObjectivesProgress = 0;
      let validObjectivesCount = 0;

      resultKeysByObjective.forEach((objectiveResultKeys, _objectiveId) => {
        let totalResultKeyProgress = 0;
        let validResultKeysCount = 0;

        objectiveResultKeys.forEach((resultKey) => {
          const targetValue = parseFloat(
            resultKey.target_value?.toString() || '0'
          );
          const initialValue = parseFloat(
            resultKey.initial_value?.toString() || '0'
          );

          if (targetValue !== 0 && resultKey.id) {
            let currentValue = initialValue;

            if (isCurrentOrFutureMonth) {
              currentValue = parseFloat(
                resultKey.current_value?.toString() || initialValue.toString()
              );
            } else {
              const relevantCheckins = checkins
                .filter(
                  (checkin) =>
                    checkin.id_result_key === resultKey.id &&
                    new Date(checkin.created_at as Date) <= endOfMonth
                )
                .sort(
                  (a, b) =>
                    new Date(b.created_at as Date).getTime() -
                    new Date(a.created_at as Date).getTime()
                );

              if (relevantCheckins.length > 0) {
                const latestCheckin = relevantCheckins[0];
                currentValue = parseFloat(
                  latestCheckin.new_value?.toString() || initialValue.toString()
                );
              }
            }

            let progress = 0;
            if (targetValue > initialValue) {
              progress =
                ((currentValue - initialValue) / (targetValue - initialValue)) *
                100;
            } else if (targetValue < initialValue) {
              progress =
                ((initialValue - currentValue) / (initialValue - targetValue)) *
                100;
            } else if (
              targetValue === initialValue &&
              currentValue >= targetValue
            ) {
              progress = 100;
            }

            const clampedProgress = Math.min(Math.max(progress, 0), 100);
            totalResultKeyProgress += clampedProgress;
            validResultKeysCount++;
          }
        });

        if (validResultKeysCount > 0) {
          const objectiveAverage =
            totalResultKeyProgress / validResultKeysCount;
          totalObjectivesProgress += objectiveAverage;
        } else {
          totalObjectivesProgress += 0;
        }

        validObjectivesCount++;
      });

      const averageProgress =
        validObjectivesCount > 0
          ? totalObjectivesProgress / validObjectivesCount
          : 0;

      cumulativeProgress[month] = Math.round(averageProgress);

      this.gateway.loggerInfo('Progresso acumulado mensal', {
        data: `Mês ${month + 1}/${year}: ${Math.round(averageProgress)}%`
      });
    }

    return cumulativeProgress;
  }
}
