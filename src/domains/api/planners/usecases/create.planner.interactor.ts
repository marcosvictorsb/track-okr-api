import { HttpResponse } from '@protocols/http';
import {
  CreatePlannerInteractorDependencies,
  InputCreatePlanner
} from '../interfaces';
import { IPresenter } from '@protocols/presenter';
import { CreatePlannerGateway } from '../gateways/create.planner.gateway';
import { UserCompanyValidationInteractor } from '@domains/common';
import {
  FeatureType,
  ICheckCompanyFeatureLimitsInteractor
} from '@domains/common/validations/interfaces/check.company.feature.limits.interface';

export class CreatePlannerInteractor {
  protected gateway: CreatePlannerGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;
  protected checkCompanyFeatureLimits: ICheckCompanyFeatureLimitsInteractor;

  constructor(params: CreatePlannerInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
    this.checkCompanyFeatureLimits = params.checkCompanyFeatureLimits;
  }

  async execute(input: InputCreatePlanner): Promise<HttpResponse> {
    try {
      const { description, title, year, id_company, id_user } = input;
      this.gateway.loggerInfo('Iniciando criação do planejamento anual', {
        description,
        title,
        year,
        id_company
      });

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

      const currentUsage = await this.checkCompanyFeatureLimits.execute({
        id_company,
        feature: FeatureType.MAX_PLANNERS,
        year
      });

      this.gateway.loggerInfo('Verificação de limites concluída', {
        id_company,
        feature: FeatureType.MAX_PLANNERS
      });

      if (!currentUsage.isWithinLimit) {
        this.gateway.loggerInfo('Limite de plannejamento anual atingido', {
          id_company,
          feature: FeatureType.MAX_PLANNERS,
          requestTxt: JSON.stringify(currentUsage)
        });
        return this.presenter.badRequest(
          'Limite de planejamento anual atingido'
        );
      }

      const criteria = { title, description, year, id_company };
      const planner = await this.gateway.createPlanner(criteria);
      this.gateway.loggerInfo('Planner criado com sucesso');

      return this.presenter.created(planner);
    } catch (error) {
      this.gateway.loggerError('Erro ao criar o planejamento anual', { error });
      return this.presenter.serverError('Error ao criar o planejamento anual');
    }
  }
}
