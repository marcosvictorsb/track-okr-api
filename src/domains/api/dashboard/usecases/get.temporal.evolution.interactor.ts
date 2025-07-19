import { HttpResponse } from '@protocols/http';
import {
  GetTemporalEvolutionInteractorDependencies,
  InputGetTemporalEvolution,
  IGetTemporalEvolutionGateway,
  FindObjectivesByCompanyAndQuarterCriteria
} from '../interfaces/get.temporal.evolution.interface';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import { QuarterData } from '../entity/temporal.evolution.entity';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';

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

      const { id_company, id_user, quarter, year, period = 'monthly' } = input;

      // Validar usuário e empresa
      const isValidUser = await this.validateUserAndCompany(
        id_user,
        id_company
      );
      if (!isValidUser) {
        return this.presenter.badRequest('Usuário ou empresa inválidos');
      }

      const currentDate = new Date();
      const currentQuarter =
        quarter || Math.ceil((currentDate.getMonth() + 1) / 3);
      const currentYear = year || currentDate.getFullYear();

      // Buscar dados do trimestre atual
      const currentQuarterData = await this.getQuarterEvolutionData(
        id_company,
        currentQuarter,
        currentYear
      );

      const temporalEvolutionData = {
        currentQuarter: currentQuarterData.data
      };

      this.gateway.loggerInfo('Evolução temporal retornada com sucesso', {
        requestTxt: `Period: ${period}, Quarter: Q${currentQuarter} ${currentYear}`
      });

      return this.presenter.ok(temporalEvolutionData);
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

  private async getQuarterEvolutionData(
    id_company: number,
    quarter: number,
    year: number
  ): Promise<QuarterData> {
    // Buscar objetivos do trimestre
    const objectives = await this.getQuarterObjectives(
      id_company,
      quarter,
      year
    );

    // Buscar e associar result keys aos objetivos
    const objectivesWithResultKeys =
      await this.associateResultKeysToObjectives(objectives);

    // Calcular evolução mensal baseada nos result key updates
    const monthlyData = await this.calculateMonthlyEvolution(
      objectivesWithResultKeys,
      year,
      quarter
    );

    return {
      name: `Q${quarter} ${year}`,
      data: monthlyData,
      color: '#3B82F6'
    };
  }

  private async getQuarterObjectives(
    id_company: number,
    quarter: number,
    year: number
  ): Promise<ObjectiveEntity[]> {
    const criteria: FindObjectivesByCompanyAndQuarterCriteria = {
      id_company,
      quarter,
      year
    };

    return await this.gateway.findObjectivesByCompanyAndQuarter(criteria);
  }

  private async associateResultKeysToObjectives(
    objectives: ObjectiveEntity[]
  ): Promise<ObjectiveEntity[]> {
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

    return objectives;
  }

  private async calculateMonthlyEvolution(
    objectives: ObjectiveEntity[],
    year: number,
    quarter: number
  ): Promise<number[]> {
    // Coletar todos os IDs de result keys
    const resultKeyIds: number[] = [];
    const resultKeyTargets = new Map<number, number>();

    for (const objective of objectives) {
      const resultKeys = objective.result_keys || [];
      for (const resultKey of resultKeys) {
        if (resultKey.id) {
          resultKeyIds.push(resultKey.id);
          resultKeyTargets.set(resultKey.id, resultKey.target_value);
        }
      }
    }

    if (resultKeyIds.length === 0) {
      return new Array(3).fill(0);
    }

    // Determinar o período do trimestre
    const quarterMonths = this.getQuarterMonths(quarter);
    const startMonth = quarterMonths[0]; // Primeiro mês do trimestre
    const endMonth = quarterMonths[quarterMonths.length - 1]; // Último mês do trimestre

    // Buscar atualizações apenas do período do trimestre
    const updates = await this.gateway.findCheckinsByIds({
      resultKeyIds,
      startDate: new Date(year, startMonth, 1), // Primeiro dia do primeiro mês do trimestre
      endDate: new Date(year, endMonth + 1, 0) // Último dia do último mês do trimestre
    });

    // Calcular progresso mensal
    return this.calculateMonthlyProgressFromUpdates(
      updates,
      resultKeyTargets,
      year,
      quarter
    );
  }

  private calculateMonthlyProgressFromUpdates(
    updates: Array<{
      id_result_key: number;
      new_value: number;
      created_at?: Date;
    }>,
    resultKeyTargets: Map<number, number>,
    year: number,
    quarter: number
  ): number[] {
    // Retornar apenas os 3 meses do trimestre, não 12 meses
    const monthlyProgress = new Array(3).fill(0);
    const monthlyCount = new Array(3).fill(0);

    // Determinar os meses do trimestre
    const quarterMonths = this.getQuarterMonths(quarter);

    updates.forEach((update) => {
      if (!update.created_at) return;

      const updateDate = new Date(update.created_at);
      if (updateDate.getFullYear() === year) {
        const month = updateDate.getMonth(); // 0-11
        const quarterMonthIndex = quarterMonths.indexOf(month);

        if (quarterMonthIndex !== -1) {
          const targetValue = resultKeyTargets.get(update.id_result_key) || 1;
          const progress = (update.new_value / targetValue) * 100;

          monthlyProgress[quarterMonthIndex] += Math.min(progress, 100); // Cap at 100%
          monthlyCount[quarterMonthIndex] += 1;
        }
      }
    });

    // Calcular médias por mês
    return monthlyProgress.map((total, index) =>
      monthlyCount[index] > 0 ? Math.round(total / monthlyCount[index]) : 0
    );
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
      default:
        return [];
    }
  }
}
