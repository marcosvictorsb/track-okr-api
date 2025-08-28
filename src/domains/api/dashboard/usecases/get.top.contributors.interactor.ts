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
import { ResultKeyEntity } from '@domains/api/results-keys/entity/result-key.entity';

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

      // 4. Processar checkins e calcular estatísticas
      const checkins = await this.getCheckinsFromResultKeys(resultKeys);
      const checkinsWithUsers = await this.enrichCheckinsWithUserData(checkins);

      console.log(
        'Checkins with user data:',
        JSON.stringify(checkinsWithUsers, null, 2)
      );

      const contributorStats =
        this.calculateContributorStats(checkinsWithUsers);

      // 5. Gerar rankings
      const rankings = this.generateRankings(
        contributorStats,
        checkinsWithUsers
      );

      this.gateway.loggerInfo('Top contributors calculados com sucesso', {
        count: checkins.length,
        data: `Company: ${input.id_company}, Contributors: ${rankings.topContributorsByCheckins.length}`
      });

      return this.presenter.ok(rankings);
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

  private async getCheckinsFromResultKeys(resultKeys: ResultKeyEntity[]) {
    const resultKeyIds = resultKeys
      .map((rk) => rk.id)
      .filter((id): id is number => id !== undefined);

    return await this.gateway.findCheckinsByResultKeyIds(resultKeyIds);
  }

  private calculateContributorStats(checkins: CheckinWithUserData[]) {
    const contributorStats: Record<
      number,
      { totalCheckins: number; totalProgress: number }
    > = {};

    for (const c of checkins) {
      const userId = c.id_user;
      if (!userId) continue;

      if (!contributorStats[userId]) {
        contributorStats[userId] = { totalCheckins: 0, totalProgress: 0 };
      }
      contributorStats[userId].totalCheckins += 1;

      const previousValue = c.previous_value ?? 0;
      const newValue = c.new_value ?? 0;
      contributorStats[userId].totalProgress += newValue - previousValue;
    }

    return contributorStats;
  }

  private generateRankings(
    contributorStats: Record<
      number,
      { totalCheckins: number; totalProgress: number }
    >,
    checkinsWithUsers: CheckinWithUserData[]
  ) {
    // Criar mapa de usuários para acesso rápido
    const userMap = new Map();
    checkinsWithUsers.forEach((checkin) => {
      if (checkin.user) {
        userMap.set(checkin.user.id, checkin.user);
      }
    });

    // Converter em array para ordenar
    const contributorsArray = Object.entries(contributorStats).map(
      ([userId, stats]) => ({
        id_user: Number(userId),
        user: userMap.get(Number(userId)) || null,
        ...stats
      })
    );

    // Top por quantidade de checkins
    const topContributorsByCheckins = [...contributorsArray].sort(
      (a, b) => b.totalCheckins - a.totalCheckins
    );

    // Top por valor acumulado
    const topContributorsByValue = [...contributorsArray].sort(
      (a, b) => b.totalProgress - a.totalProgress
    );

    return {
      topContributorsByCheckins,
      topContributorsByValue
    };
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
}
