import { MixGetAnnualPlanningGateway } from '@adapters/gateways/api/dashboard';
import { logger } from '@configs/logger';
import {
  IPlannerRepository,
  FindPlannerCriteria
} from '@domains/api/planners/interfaces';
import {
  IObjectiveRepository,
  FindObjectiveCriteria
} from '@domains/api/objectives/interfaces';
import { IResultKeyRepository } from '@domains/api/results-keys/interfaces';
import {
  IGetAnnualPlanningGateway,
  GetAnnualPlanningGatewayDependencies,
  AnnualPlanningItem
} from '../interfaces/get.annual.planning.interface';

export class GetAnnualPlanningGateway
  extends MixGetAnnualPlanningGateway
  implements IGetAnnualPlanningGateway
{
  plannerRepository: IPlannerRepository;
  objectiveRepository: IObjectiveRepository;
  resultKeyRepository: IResultKeyRepository;
  logging: typeof logger;

  constructor(params: GetAnnualPlanningGatewayDependencies) {
    super(params);
    this.plannerRepository = params.plannerRepository;
    this.objectiveRepository = params.objectiveRepository;
    this.resultKeyRepository = params.resultKeyRepository;
    this.logging = params.logging;
  }

  async getAnnualPlannings(
    year: number,
    quarter: number,
    companyId: number
  ): Promise<AnnualPlanningItem[]> {
    this.logging.info('Buscando planejamentos anuais', {
      year,
      quarter,
      companyId
    });

    try {
      // 1. Buscar todos os planejamentos do ano e empresa
      const plannerCriteria: FindPlannerCriteria = {
        year,
        id_company: companyId
      };

      const planners = await this.plannerRepository.findAll(plannerCriteria);

      if (!planners || planners.length === 0) {
        this.logging.info('Nenhum planejamento encontrado', {
          year,
          quarter,
          companyId
        });
        return [];
      }

      // 2. Buscar todos os objetivos do quarter especificado
      const objectiveCriteria: FindObjectiveCriteria = {
        id_company: companyId,
        quarter,
        year
      };

      const objectives =
        await this.objectiveRepository.findMany(objectiveCriteria);

      if (objectives.length === 0) {
        this.logging.info('Nenhum objetivo encontrado', {
          year,
          quarter,
          companyId
        });
        return planners.map((planner) => ({
          id: planner.id!,
          title: planner.title,
          description: planner.description,
          totalObjectives: 0,
          completedObjectives: 0,
          overallProgressPercentage: 0
        }));
      }

      // 3. Buscar result keys dos objetivos
      const objectiveIds = objectives
        .map((obj) => obj.id!)
        .filter((id) => id !== undefined);
      const resultKeys =
        await this.resultKeyRepository.findByObjectiveIds(objectiveIds);

      // 4. Calcular progresso dos objetivos baseado em result keys
      const objectivesWithProgress = objectives.map((objective) => {
        const objectiveResultKeys = resultKeys.filter(
          (rk) => rk.id_okr === objective.id
        );

        if (objectiveResultKeys.length === 0) {
          return {
            ...objective,
            progress: 0
          };
        }

        // Calcular progresso médio das result keys do objetivo
        const totalProgress = objectiveResultKeys.reduce((sum, rk) => {
          const targetValue = parseFloat(rk.target_value?.toString() || '0');
          const initialValue = parseFloat(rk.initial_value?.toString() || '0');
          const currentValue = parseFloat(rk.current_value?.toString() || '0');

          if (targetValue > initialValue) {
            const progress =
              ((currentValue - initialValue) / (targetValue - initialValue)) *
              100;
            return sum + Math.min(Math.max(progress, 0), 100);
          }
          return sum;
        }, 0);

        const averageProgress = totalProgress / objectiveResultKeys.length;

        return {
          ...objective,
          progress: averageProgress
        };
      });

      // 5. Mapear planejamentos com estatísticas
      const planningsWithStats = planners.map((planner) => {
        const plannerObjectives = objectivesWithProgress.filter(
          (obj) => obj.id_planner === planner.id
        );

        const totalObjectives = plannerObjectives.length;
        const completedObjectives = plannerObjectives.filter(
          (obj) => obj.progress >= 100
        ).length;

        // Calcular progresso geral do planejamento
        const totalProgress = plannerObjectives.reduce(
          (sum, obj) => sum + obj.progress,
          0
        );
        const overallProgressPercentage =
          totalObjectives > 0 ? Math.round(totalProgress / totalObjectives) : 0;

        return {
          id: planner.id!,
          title: planner.title,
          description: planner.description,
          totalObjectives,
          completedObjectives,
          overallProgressPercentage
        } as AnnualPlanningItem;
      });

      this.logging.info('Planejamentos anuais encontrados', {
        count: planningsWithStats.length,
        year,
        quarter,
        companyId
      });

      return planningsWithStats;
    } catch (error) {
      this.logging.error('Erro ao buscar planejamentos anuais', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        year,
        quarter,
        companyId
      });
      throw error;
    }
  }
}
