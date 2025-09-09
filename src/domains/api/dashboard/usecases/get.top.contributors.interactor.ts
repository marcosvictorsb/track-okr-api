import { HttpResponse } from '@protocols/http';
import {
  GetTopContributorsInteractorDependencies,
  InputGetTopContributors,
  IGetTopContributorsGateway,
  FindObjectivesByCompanyCriteria
} from '../interfaces/get.top.contributors.interface';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';

interface CheckinData {
  id: number;
  id_result_key: number;
  previous_value: number | null;
  new_value: number;
  comment: string;
  id_user: number;
  created_at: string;
}

interface CheckinWithUserData extends CheckinData {
  user: {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
  } | null;
}

interface SimpleUser {
  id: number;
  name: string;
  email: string | null;
  avatar_url: string | null;
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

      const { id_company, id_user, quarter, year } = input;

      // 1. Validar usuário e empresa
      const isValidUser = await this.validateUserAndCompany(
        id_user,
        id_company
      );
      if (!isValidUser) {
        return this.presenter.badRequest('O usuário ou empresa não é válido');
      }

      // 2. Buscar objetivos da empresa
      const objectives = await this.getCompanyObjectives(
        id_company,
        quarter,
        year
      );
      if (!objectives || objectives.length === 0) {
        return this.getEmptyResponse(
          'Nenhum objetivo encontrado para a empresa',
          { id_company }
        );
      }

      // 3. Buscar result keys dos objetivos
      const resultKeys = await this.getResultKeysFromObjectives(objectives);
      if (!resultKeys || resultKeys.length === 0) {
        return this.getEmptyResponse(
          'Nenhuma result key encontrada para os objetivos da empresa',
          {
            id_company,
            ids_objectives: objectives.map((obj) => obj.id)
          }
        );
      }

      // Agrupar result-keys por objetivo
      objectives.forEach((objective: ObjectiveEntity) => {
        objective.result_keys = resultKeys.filter(
          (resultKey) => resultKey.id_okr === objective.id
        );
      });

      // 4. Calcular quantos result keys cada usuário tem
      const userResultKeysCount = this.calculateUserResultKeysCount(objectives);

      // 5. Buscar informações dos usuários
      const userIds = Array.from(userResultKeysCount.keys());
      const users = await this.gateway.findUsersProfileByIds(userIds);

      // 6. Calcular porcentagem de progresso de cada usuário
      const userProgressPercentages = this.calculateUserProgressPercentages(
        objectives,
        Array.from(userResultKeysCount.keys())
      );

      // 7. Montar o ranking dos usuários com porcentagem e quantidade de result keys
      const topUsersByResultKeys = this.buildUserResultKeysRanking(
        userResultKeysCount,
        userProgressPercentages,
        users
      );

      return this.presenter.ok(topUsersByResultKeys);
    } catch (error) {
      return this.handleError(error, input);
    }
  }

  private async enrichCheckinsWithUserData(
    checkins: CheckinData[]
  ): Promise<CheckinWithUserData[]> {
    const id_users = checkins
      .map((c) => c.id_user)
      .filter((id): id is number => id !== undefined);
    const unique_user_ids = Array.from(new Set(id_users));

    const users = await this.gateway.findUsersProfileByIds(unique_user_ids);

    // Criar um mapa para acesso rápido aos usuários
    const userMap = new Map(users.map((user) => [user.id, user]));

    // Enriquecer cada checkin com os dados do usuário
    return checkins.map((checkin) => ({
      ...checkin,
      user: userMap.get(checkin.id_user) || null
    }));
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

  private async validateUserAndCompany(
    id_user: number,
    id_company: number
  ): Promise<boolean> {
    const validation = await this.userCompanyValidator.execute({
      id_user,
      id_company
    });

    if (!validation.isValid) {
      this.gateway.loggerError('O usuário ou empresa não é válido', {
        id_company,
        id_user
      });
      return false;
    }

    return true;
  }

  private getEmptyResponse(
    message: string,
    data: Record<string, unknown>
  ): HttpResponse {
    this.gateway.loggerInfo(message, data);
    return this.presenter.ok({
      topContributorsByCheckins: [],
      topContributorsByValue: []
    });
  }

  private async getResultKeysFromObjectives(objectives: ObjectiveEntity[]) {
    const objectiveIds = objectives
      .map((obj) => obj.id)
      .filter((id): id is number => id !== undefined);

    return await this.gateway.findResultKeysByObjectiveIds(objectiveIds);
  }

  private handleError(
    error: unknown,
    input: InputGetTopContributors
  ): HttpResponse {
    console.log(error);
    this.gateway.loggerError('Erro ao buscar top contributors', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      requestTxt: JSON.stringify(input)
    });

    return this.presenter.serverError(
      'Erro interno do servidor ao buscar top contributors'
    );
  }

  // Método para calcular quantos result keys cada usuário tem
  private calculateUserResultKeysCount(
    objectives: ObjectiveEntity[]
  ): Map<number, number> {
    const userResultKeysCount = new Map<number, number>();

    objectives.forEach((objective) => {
      objective.result_keys?.forEach((resultKey) => {
        if (resultKey.responsible_users) {
          // Normalizar responsible_users para array
          const responsibleUsersArray = this.parseResponsibleUsers(
            resultKey.responsible_users
          );

          responsibleUsersArray.forEach((userId) => {
            const currentCount = userResultKeysCount.get(userId) || 0;
            userResultKeysCount.set(userId, currentCount + 1);
          });
        }
      });
    });

    return userResultKeysCount;
  }

  // Método para calcular porcentagem de progresso de cada usuário
  private calculateUserProgressPercentages(
    objectives: ObjectiveEntity[],
    userIds: number[]
  ): Map<number, number> {
    const userProgressMap = new Map<number, number>();

    userIds.forEach((userId) => {
      let totalProgress = 0;
      let resultKeysCount = 0;

      objectives.forEach((objective) => {
        objective.result_keys?.forEach((resultKey) => {
          const responsibleUsers = this.parseResponsibleUsers(
            resultKey.responsible_users
          );

          if (responsibleUsers.includes(userId)) {
            // Calcular progresso deste result key
            const currentValue = parseFloat(
              resultKey.current_value?.toString() || '0'
            );
            const targetValue = parseFloat(
              resultKey.target_value?.toString() || '0'
            );
            const initialValue = parseFloat(
              resultKey.initial_value?.toString() || '0'
            );

            if (targetValue > initialValue) {
              const progress =
                ((currentValue - initialValue) / (targetValue - initialValue)) *
                100;
              const clampedProgress = Math.min(Math.max(progress, 0), 100); // Entre 0 e 100%
              totalProgress += clampedProgress;
              resultKeysCount++;
            }
          }
        });
      });

      // Calcular média de progresso do usuário
      const averageProgress =
        resultKeysCount > 0 ? totalProgress / resultKeysCount : 0;
      userProgressMap.set(userId, Math.round(averageProgress));
    });

    return userProgressMap;
  }

  // Método para montar o ranking com informações dos usuários
  private buildUserResultKeysRanking(
    userResultKeysCount: Map<number, number>,
    userProgressPercentages: Map<number, number>,
    users: SimpleUser[]
  ): Array<{
    id_user: number;
    user: SimpleUser;
    resultKeysCount: number;
    progressPercentage: number;
  }> {
    // Criar mapa dos usuários para acesso rápido
    const userMap = new Map<number, SimpleUser>();
    users.forEach((user) => {
      userMap.set(user.id, user);
    });

    const ranking = Array.from(userResultKeysCount.entries())
      .map(([userId, count]) => ({
        id_user: userId,
        user: userMap.get(userId) || {
          id: userId,
          name: 'Unknown',
          email: null,
          avatar_url: null
        },
        resultKeysCount: count,
        progressPercentage: userProgressPercentages.get(userId) || 0
      }))
      .sort((a, b) => b.progressPercentage - a.progressPercentage); // Ordenar por progresso

    return ranking;
  }
  // Método auxiliar para normalizar responsible_users
  private parseResponsibleUsers(responsibleUsers: unknown): number[] {
    if (!responsibleUsers) {
      return [];
    }

    if (Array.isArray(responsibleUsers)) {
      return responsibleUsers.filter(
        (id) => typeof id === 'number' && !isNaN(id)
      );
    }

    if (typeof responsibleUsers === 'string') {
      try {
        const parsed = JSON.parse(responsibleUsers);
        return Array.isArray(parsed)
          ? parsed.filter((id) => typeof id === 'number' && !isNaN(id))
          : [];
      } catch {
        return [];
      }
    }

    return [];
  }
}
