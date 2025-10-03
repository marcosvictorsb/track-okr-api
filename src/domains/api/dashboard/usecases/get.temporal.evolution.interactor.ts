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

      // Validar usuário e empresa
      const isValidUser = await this.validateUserAndCompany(
        id_user,
        id_company
      );

      if (!isValidUser) {
        return this.presenter.badRequest('Usuário ou empresa inválidos');
      }

      // Se quarter = 5, usar lógica específica para ano todo
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

      // Calcular progresso acumulado baseado no progresso real das OKRs
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

  // Método específico para lidar com quarter 5 (ano todo)
  private async handleYearlyEvolution(
    id_company: number,
    year: number
  ): Promise<HttpResponse> {
    this.gateway.loggerInfo('Processando evolução temporal anual (quarter 5)', {
      id_company,
      year
    });

    // Buscar todos os objetivos do ano
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

    // Calcular evolução mensal para o ano todo
    const monthlyEvolution = await this.calculateYearlyMonthlyEvolution(
      resultKeys,
      checkins,
      year,
      id_company
    );

    // Calcular progresso acumulado mensal
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
    // Criar data do primeiro dia do próximo mês e subtrair 1 dia
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

    // 2. Para cada result key, calcular o progresso semanal
    resultKeyIds.forEach((resultKeyId) => {
      const resultKey = resultKeys.find((rk) => rk.id === resultKeyId);
      if (!resultKey) return;

      // 3. Pegar checkins desta result key na semana
      const resultKeyCheckins = checkinsInWeek.filter(
        (checkin) => checkin.id_result_key === resultKeyId
      );

      if (resultKeyCheckins.length === 0) return;

      // 4. Encontrar menor previous_value e maior new_value da semana
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

      // 5. Calcular evolução semanal desta result key
      const weeklyEvolution = maxNewValue - minPreviousValue;

      // 6. Calcular porcentagem baseada no target_value
      const targetValue = parseFloat(resultKey.target_value?.toString() || '0');
      const initialValue = parseFloat(
        resultKey.initial_value?.toString() || '0'
      );

      if (targetValue > initialValue) {
        // Calcular quanto % da meta foi evoluído nesta semana
        const totalGoal = targetValue - initialValue;
        const weeklyProgressPercentage = (weeklyEvolution / totalGoal) * 100;

        // Garantir que não seja negativo
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

    // 7. Retornar média do progresso semanal
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

    // Se quarter não for 5, adicionar filtro de quarter
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

  private getWeekNumber(date: Date) {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7; // domingo = 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
    return weekNum;
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

    // Buscar TODOS os objetivos do quarter (incluindo os sem result keys)
    const allObjectives = await this.gateway.findObjectivesByCompanyAndQuarter({
      id_company,
      quarter,
      year
    });

    // Agrupar result keys por objetivo
    const resultKeysByObjective = new Map<number, ResultKeyEntity[]>();

    // Primeiro, inicializar TODOS os objetivos com array vazio
    allObjectives.forEach((objective) => {
      if (objective.id) {
        resultKeysByObjective.set(objective.id, []);
      }
    });

    // Depois, adicionar as result keys aos objetivos correspondentes
    resultKeys.forEach((rk) => {
      if (rk.id_okr && resultKeysByObjective.has(rk.id_okr)) {
        resultKeysByObjective.get(rk.id_okr)!.push(rk);
      }
    });

    // Para cada semana, calcular o progresso acumulado real até aquela data
    for (let monthIndex = 0; monthIndex < 3; monthIndex++) {
      const month = months[monthIndex];

      // Definir as 4 semanas do mês
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

        // Para a última semana do quarter, SEMPRE usar o current_value das result keys
        // independentemente de ser passada ou não, pois representa o estado final
        const isLastWeekOfQuarter = globalWeekIndex === 11;
        const isCurrentOrFutureWeek =
          week.end >= currentDate || isLastWeekOfQuarter;

        // Calcular progresso por objetivo
        let totalObjectivesProgress = 0;
        let validObjectivesCount = 0;

        resultKeysByObjective.forEach((objectiveResultKeys, objectiveId) => {
          let totalResultKeyProgress = 0;
          let validResultKeysCount = 0;

          // Para cada result key do objetivo
          objectiveResultKeys.forEach((resultKey) => {
            const targetValue = parseFloat(
              resultKey.target_value?.toString() || '0'
            );
            const initialValue = parseFloat(
              resultKey.initial_value?.toString() || '0'
            );

            // Incluir TODAS as result keys válidas (com target definido)
            if (targetValue !== 0 && resultKey.id) {
              let currentValue = initialValue;

              if (isCurrentOrFutureWeek || isLastWeekOfQuarter) {
                // Para semanas atuais/futuras OU última semana, usar o current_value da result key
                currentValue = parseFloat(
                  resultKey.current_value?.toString() || initialValue.toString()
                );

                this.gateway.loggerInfo('Usando current_value da result key', {
                  data: `Semana ${globalWeekIndex} - RK ${resultKey.id}: usando current_value ${currentValue} (isLastWeek: ${isLastWeekOfQuarter})`
                });
              } else {
                // Para semanas passadas (exceto a última), buscar o valor baseado nos checkins até aquela data
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
                  // Usar o new_value do checkin mais recente até essa data
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
                // Se não tem checkins até essa data, currentValue fica como initialValue
              }

              // Calcular progresso percentual desta result key até esta semana
              let progress = 0;
              if (targetValue > initialValue) {
                // Meta crescente (ex: 0 -> 100)
                progress =
                  ((currentValue - initialValue) /
                    (targetValue - initialValue)) *
                  100;
              } else if (targetValue < initialValue) {
                // Meta decrescente (ex: 100 -> 0)
                progress =
                  ((initialValue - currentValue) /
                    (initialValue - targetValue)) *
                  100;
              } else if (
                targetValue === initialValue &&
                currentValue >= targetValue
              ) {
                // Meta binária atingida (ex: 0 -> 1 e atual = 1)
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

          // Calcular média do objetivo (SEMPRE incluir o objetivo, mesmo sem RKs)
          if (validResultKeysCount > 0) {
            const objectiveAverage =
              totalResultKeyProgress / validResultKeysCount;
            totalObjectivesProgress += objectiveAverage;

            this.gateway.loggerInfo('Progresso do objetivo', {
              data: `Semana ${globalWeekIndex} - Objetivo ${objectiveId}: ${objectiveAverage.toFixed(1)}% (${validResultKeysCount} RKs)`
            });
          } else {
            // Objetivo sem result keys válidas = 0%
            totalObjectivesProgress += 0;

            this.gateway.loggerInfo('Objetivo sem result keys válidas', {
              data: `Semana ${globalWeekIndex} - Objetivo ${objectiveId}: 0% (sem RKs válidas)`
            });
          }

          // SEMPRE contar o objetivo, mesmo sem RKs
          validObjectivesCount++;
        });

        // Calcular média geral dos objetivos
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

  // Calcular evolução mensal para o ano todo (quarter 5)
  private async calculateYearlyMonthlyEvolution(
    resultKeys: ResultKeyEntity[],
    checkins: CheckinsEntity[],
    year: number,
    _id_company: number
  ): Promise<number[]> {
    const monthlyEvolution = new Array(12).fill(0);
    const resultKeyIds = this.getResultKeyIds(resultKeys);

    // Para cada mês do ano
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);
      const endDate = this.getLastDayOfMonth(year, month);

      // Calcular progresso do mês usando a lógica existente
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

  // Calcular progresso acumulado mensal para o ano todo (quarter 5)
  private async calculateYearlyCumulativeProgress(
    resultKeys: ResultKeyEntity[],
    checkins: CheckinsEntity[],
    year: number,
    id_company: number
  ): Promise<number[]> {
    const cumulativeProgress = new Array(12).fill(0);

    // Buscar TODOS os objetivos do ano
    const allObjectives = await this.gateway.findObjectivesByCompanyAndQuarter({
      id_company,
      year,
      quarter: undefined
    } as unknown as Parameters<
      typeof this.gateway.findObjectivesByCompanyAndQuarter
    >[0]);

    // Agrupar result keys por objetivo
    const resultKeysByObjective = new Map<number, ResultKeyEntity[]>();

    // Inicializar TODOS os objetivos com array vazio
    allObjectives.forEach((objective) => {
      if (objective.id) {
        resultKeysByObjective.set(objective.id, []);
      }
    });

    // Adicionar as result keys aos objetivos correspondentes
    resultKeys.forEach((rk) => {
      if (rk.id_okr && resultKeysByObjective.has(rk.id_okr)) {
        resultKeysByObjective.get(rk.id_okr)!.push(rk);
      }
    });

    // Para cada mês, calcular o progresso acumulado
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
              // Para mêses atuais/futuros, usar current_value
              currentValue = parseFloat(
                resultKey.current_value?.toString() || initialValue.toString()
              );
            } else {
              // Para mêses passados, buscar checkins até o final do mês
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

            // Calcular progresso percentual
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

        // Calcular média do objetivo
        if (validResultKeysCount > 0) {
          const objectiveAverage =
            totalResultKeyProgress / validResultKeysCount;
          totalObjectivesProgress += objectiveAverage;
        } else {
          totalObjectivesProgress += 0;
        }

        validObjectivesCount++;
      });

      // Calcular média geral dos objetivos
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
