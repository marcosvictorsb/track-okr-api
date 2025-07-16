import { HttpResponse } from '@protocols/http';
import {
  GetTopContributorsInteractorDependencies,
  InputGetTopContributors,
  IGetTopContributorsGateway,
  FindObjectivesByCompanyCriteria
} from '../interfaces/get.top.contributors.interface';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import {
  TopContributorsEntity,
  ContributorItem,
  PaginationInfo
} from '../entity/top.contributors.entity';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import { DashboardOverviewEntity } from '../entity/dashboard.overview.entity';
import { logger } from '@configs/logger';

interface UserContribution {
  userId: number;
  totalProgress: number;
  keyResultsUpdated: number;
  lastActivity: Date;
  contributions: number;
}

export class GetTopContributorsInteractor {
  protected gateway: IGetTopContributorsGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: GetTopContributorsInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  public async execute(input: InputGetTopContributors): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Iniciando busca de top contributors', {
        requestTxt: JSON.stringify(input)
      });

      const {
        id_company,
        id_user,
        quarter,
        year,
        limit = 10,
        page = 1
      } = input;

      // Validar usuário e empresa
      const isValidUser = await this.validateUserAndCompany(
        id_user,
        id_company
      );
      if (!isValidUser) {
        return this.presenter.badRequest('Usuário ou empresa inválidos');
      }

      // Buscar objetivos da empresa no período
      const objectives = await this.getCompanyObjectives(
        id_company,
        quarter,
        year
      );

      // Buscar e associar result keys aos objetivos
      const objectivesWithResultKeys =
        await this.associateResultKeysToObjectives(objectives);

      // Calcular contribuições por usuário
      const userContributions = this.calculateUserContributions(
        objectivesWithResultKeys
      );

      // Enriquecer contribuições com contagem real de check-ins
      const enrichedUserContributions =
        await this.enrichUserContributionsWithCheckIns(
          userContributions,
          objectives
        );

      // Ordenar e paginar contributors
      const topContributors = await this.buildTopContributors(
        enrichedUserContributions,
        objectivesWithResultKeys,
        limit,
        page
      );

      // Calcular informações de paginação
      const pagination = this.buildPagination(
        userContributions.length,
        page,
        limit
      );

      const contributorsData = new TopContributorsEntity({
        contributors: topContributors,
        pagination
      });

      this.gateway.loggerInfo('Top contributors retornado com sucesso', {
        requestTxt: `Total contributors: ${topContributors.length}`
      });

      return this.presenter.ok(contributorsData);
    } catch (error) {
      this.gateway.loggerError('Erro ao buscar top contributors', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        requestTxt: JSON.stringify(input)
      });

      return this.presenter.serverError(
        'Erro interno do servidor ao buscar top contributors'
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

  private async getCompanyObjectives(
    id_company: number,
    quarter?: number,
    year?: number
  ): Promise<ObjectiveEntity[]> {
    const criteria: FindObjectivesByCompanyCriteria = {
      id_company,
      quarter,
      year
    };

    return await this.gateway.findObjectivesByCompany(criteria);
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

  private calculateUserContributions(
    objectives: ObjectiveEntity[]
  ): UserContribution[] {
    const userContributionsMap = new Map<number, UserContribution>();

    for (const objective of objectives) {
      const resultKeys = objective.result_keys || [];

      for (const resultKey of resultKeys) {
        // Usar responsible_users array para determinar os usuários responsáveis
        const responsibleUsers = resultKey.responsible_users || [];

        if (responsibleUsers.length === 0) {
          continue; // Pular result keys sem responsáveis
        }
        for (const userId of responsibleUsers) {
          if (userId) {
            // Obter contribuição existente ou criar nova
            const contribution = userContributionsMap.get(userId) || {
              userId,
              totalProgress: 0,
              keyResultsUpdated: 0,
              lastActivity: new Date(0),
              contributions: 0
            };

            // Calcular progresso do result key
            const progress = DashboardOverviewEntity.calculateProgress(
              resultKey.current_value,
              resultKey.target_value
            );

            contribution.totalProgress += progress;
            contribution.keyResultsUpdated += 1;

            // Atualizar última atividade
            if (resultKey.updated_at) {
              const updateDate = new Date(resultKey.updated_at);
              if (updateDate > contribution.lastActivity) {
                contribution.lastActivity = updateDate;
              }
            }

            userContributionsMap.set(userId, contribution);
          }
        }
      }
    }

    return Array.from(userContributionsMap.values());
  }

  private async buildTopContributors(
    userContributions: UserContribution[],
    objectivesWithResultKeys: ObjectiveEntity[],
    limit: number,
    page: number
  ): Promise<ContributorItem[]> {
    // Ordenar por contribuições (decrescente)
    const sortedContributions = userContributions
      .sort((a, b) => b.contributions - a.contributions)
      .slice((page - 1) * limit, page * limit);

    const contributors: ContributorItem[] = [];

    for (const contribution of sortedContributions) {
      const contributor = await this.buildSingleContributor(
        contribution,
        objectivesWithResultKeys
      );
      if (contributor) {
        contributors.push(contributor);
      }
    }

    return contributors;
  }

  private async buildSingleContributor(
    contribution: UserContribution,
    objectivesWithResultKeys: ObjectiveEntity[]
  ): Promise<ContributorItem | null> {
    try {
      // Buscar dados do usuário
      const user = await this.gateway.findUserById(contribution.userId);
      if (!user) {
        return null;
      }

      // Buscar dados do time
      let team = { id: '0', name: 'Sem time' };
      if (user.current_team_id) {
        const teamEntity = await this.gateway.findTeamById(
          user.current_team_id
        );
        if (teamEntity && teamEntity.id) {
          team = {
            id: teamEntity.id.toString(),
            name: teamEntity.name
          };
        }
      }

      // Buscar avatar
      const avatar = await this.gateway.findUserProfileAvatar(
        contribution.userId
      );

      // Calcular impact score
      const impactScore = TopContributorsEntity.calculateImpactScore(
        contribution.totalProgress,
        contribution.keyResultsUpdated,
        contribution.contributions
      );

      // Calcular check-ins da semana atual para este usuário específico
      const checkInsThisWeek = await this.calculateUserCheckInsThisWeek(
        contribution.userId,
        objectivesWithResultKeys
      );

      return {
        id: user.id || 0,
        name: user.name,
        email: user.email,
        avatar: avatar || '',
        team,
        contributions: contribution.contributions,
        impactScore,
        lastActivity: contribution.lastActivity.toISOString(),
        keyResultsUpdated: contribution.keyResultsUpdated,
        checkInsThisWeek
      };
    } catch (error) {
      logger.error('Erro ao construir contributor', {
        userId: contribution.userId,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return null;
    }
  }

  private buildPagination(
    total: number,
    page: number,
    limit: number
  ): PaginationInfo {
    const totalPages = Math.ceil(total / limit);

    return {
      total,
      page,
      limit,
      totalPages
    };
  }

  private async enrichUserContributionsWithCheckIns(
    userContributions: UserContribution[],
    objectives: ObjectiveEntity[]
  ): Promise<UserContribution[]> {
    // Coletar todos os IDs de result keys
    const resultKeyIds: number[] = [];
    for (const objective of objectives) {
      const resultKeys = objective.result_keys || [];
      for (const resultKey of resultKeys) {
        if (resultKey.id) {
          resultKeyIds.push(resultKey.id);
        }
      }
    }

    // Definir período da semana atual
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Domingo
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sábado
    endOfWeek.setHours(23, 59, 59, 999);

    // Buscar contagem de check-ins agrupados por usuário
    const userCheckInData = await this.gateway.countCheckInsByResultKeyIds(
      resultKeyIds,
      startOfWeek,
      endOfWeek
    );

    // Criar um mapa para facilitar a busca
    const userCheckInMap = new Map<number, number>();
    userCheckInData.forEach(({ id_user, check_ins }) => {
      userCheckInMap.set(id_user, check_ins);
    });

    // Atualizar contribuições dos usuários com contagem real de check-ins
    userContributions.forEach((contribution) => {
      const checkInsThisWeek = userCheckInMap.get(contribution.userId) || 0;

      contribution.contributions = TopContributorsEntity.calculateContributions(
        contribution.keyResultsUpdated,
        checkInsThisWeek
      );
    });

    return userContributions;
  }

  private async calculateUserCheckInsThisWeek(
    userId: number,
    objectives: ObjectiveEntity[]
  ): Promise<number> {
    // Coletar IDs dos result keys onde o usuário é responsável
    const userResultKeyIds: number[] = [];

    for (const objective of objectives) {
      const resultKeys = objective.result_keys || [];
      for (const resultKey of resultKeys) {
        if (resultKey.id && resultKey.responsible_users?.includes(userId)) {
          userResultKeyIds.push(resultKey.id);
        }
      }
    }

    if (userResultKeyIds.length === 0) {
      return 0;
    }

    // Definir período da semana atual
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Domingo
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sábado
    endOfWeek.setHours(23, 59, 59, 999);

    // Buscar contagem de check-ins agrupados por usuário
    const userCheckInData = await this.gateway.countCheckInsByResultKeyIds(
      userResultKeyIds,
      startOfWeek,
      endOfWeek
    );

    // Encontrar check-ins do usuário específico
    const userCheckIns = userCheckInData.find(
      (data) => data.id_user === userId
    );

    return userCheckIns ? userCheckIns.check_ins : 0;
  }
}
