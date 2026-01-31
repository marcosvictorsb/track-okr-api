import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  RecentCheckInData,
  RecentCheckInsEntity
} from '../entity/recent-checkins.entity';
import {
  FindObjectivesByCompanyAndQuarterCriteria,
  GetRecentCheckInsInteractorDependencies,
  IGetRecentCheckInsGateway,
  InputGetRecentCheckIns
} from '../interfaces/get.recent-checkins.interface';

export class GetRecentCheckInsInteractor {
  protected gateway: IGetRecentCheckInsGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: GetRecentCheckInsInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  public async execute(input: InputGetRecentCheckIns): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Iniciando busca de check-ins recentes', {
        requestTxt: JSON.stringify(input)
      });

      const { id_company, id_user, quarter, year } = input;

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

      const objectives = await this.getQuarterObjectives(
        id_company,
        currentQuarter,
        currentYear
      );

      const objectivesWithResultKeys =
        await this.associateResultKeysToObjectives(objectives);

      const resultKeyIds = this.collectResultKeyIds(objectivesWithResultKeys);

      if (resultKeyIds.length === 0) {
        return this.presenter.ok({ currentQuarter: [] });
      }

      const recentUpdates = await this.gateway.findRecentCheckins({
        resultKeyIds,
        limit: 20
      });

      this.gateway.loggerInfo('Check-ins encontrados', {
        requestTxt: `Found ${recentUpdates.length} updates for ${resultKeyIds.length} result keys`
      });

      const checkInsData = await this.buildCheckInsData(
        recentUpdates,
        objectivesWithResultKeys
      );

      this.gateway.loggerInfo('Check-ins recentes retornados com sucesso', {
        requestTxt: `Quarter: Q${currentQuarter} ${currentYear}, Updates: ${recentUpdates.length}`
      });

      return this.presenter.ok({ recentCheckIns: checkInsData });
    } catch (error) {
      console.log(error);
      this.gateway.loggerError('Erro ao buscar check-ins recentes', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        requestTxt: JSON.stringify(input)
      });

      return this.presenter.serverError(
        'Erro interno do servidor ao buscar check-ins recentes'
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

      objectives.forEach((objective: ObjectiveEntity) => {
        objective.result_keys = resultKeys.filter(
          (resultKey) => resultKey.id_okr === objective.id
        );
      });
    }

    return objectives;
  }

  private collectResultKeyIds(objectives: ObjectiveEntity[]): number[] {
    const resultKeyIds: number[] = [];

    for (const objective of objectives) {
      const resultKeys = objective.result_keys || [];
      for (const resultKey of resultKeys) {
        if (resultKey.id) {
          resultKeyIds.push(resultKey.id);
        }
      }
    }

    return resultKeyIds;
  }

  private async buildCheckInsData(
    updates: Array<{
      id?: number;
      id_result_key: number;
      previous_value?: number | null;
      new_value: number;
      created_at?: Date;
      comment?: string | null;
      id_user?: number;
    }>,
    objectives: ObjectiveEntity[]
  ): Promise<RecentCheckInData[]> {
    const checkInsData: RecentCheckInData[] = [];

    const resultKeyMap = new Map<
      number,
      { name: string; objective?: string }
    >();

    objectives.forEach((objective) => {
      const resultKeys = objective.result_keys || [];
      resultKeys.forEach((resultKey) => {
        if (resultKey.id) {
          resultKeyMap.set(resultKey.id, {
            name: resultKey.name,
            objective: objective.title
          });
        }
      });
    });

    for (let index = 0; index < updates.length; index++) {
      const update = updates[index];
      const resultKeyInfo = resultKeyMap.get(update.id_result_key);

      if (!resultKeyInfo) continue;

      const user = update.id_user
        ? await this.gateway.findUserById(update.id_user)
        : null;

      const team = user?.id ? await this.gateway.findUserTeam(user.id) : null;

      const checkInData = RecentCheckInsEntity.formatCheckIn(
        {
          ...update,
          previous_value: update.previous_value || 0,
          comment: update.comment || undefined
        },
        user || { id: 0, name: `Usuário ${index + 1}` },
        team || { name: 'Não informado' },
        { name: resultKeyInfo.name },
        index
      );

      checkInsData.push(checkInData);
    }

    return checkInsData;
  }
}
