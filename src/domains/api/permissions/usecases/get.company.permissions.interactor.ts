import { UserCompanyValidationInteractor } from '@domains/common';
import {
  FeatureType,
  ICheckCompanyFeatureLimitsInteractor
} from '@domains/common/validations/interfaces/check.company.feature.limits.interface';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { GetCompanyPermissionsGateway } from '../gateways/get.company.permissions.gateway';
import {
  CompanyPermissionsResponse,
  FeaturePermission,
  GetCompanyPermissionsInteractorDependencies,
  InputGetCompanyPermissions
} from '../interfaces/get.company.permissions.interface';

export class GetCompanyPermissionsInteractor {
  protected gateway: GetCompanyPermissionsGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;
  protected checkCompanyFeatureLimits: ICheckCompanyFeatureLimitsInteractor;

  constructor(params: GetCompanyPermissionsInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
    this.checkCompanyFeatureLimits = params.checkCompanyFeatureLimits;
  }

  async execute(input: InputGetCompanyPermissions): Promise<HttpResponse> {
    try {
      const { id_company, id_user } = input;

      this.gateway.loggerInfo('Iniciando busca de permissões da empresa', {
        id_company,
        id_user
      });

      const userValidation = await this.userCompanyValidator.execute({
        id_user,
        id_company
      });

      if (!userValidation.isValid) {
        this.gateway.loggerInfo('Usuário ou empresa inválidos', {
          id_user,
          id_company
        });
        return this.presenter.badRequest('Usuário ou empresa inválidos');
      }

      const permissions = {
        users: await this.checkFeaturePermission(
          id_company,
          FeatureType.MAX_USER
        ),
        planners: await this.checkFeaturePermission(
          id_company,
          FeatureType.MAX_PLANNERS
        ),
        teams: await this.checkFeaturePermission(
          id_company,
          FeatureType.MAX_TEAMS
        ),
        objectives: await this.checkFeaturePermission(
          id_company,
          FeatureType.MAX_OBJECTIVES_PER_QUARTER
        )
      };

      const response: CompanyPermissionsResponse = {
        permissions
      };

      this.gateway.loggerInfo('Permissões da empresa obtidas com sucesso', {
        id_company
      });

      return this.presenter.ok(response);
    } catch (error) {
      this.gateway.loggerError('Erro ao buscar permissões da empresa', {
        error
      });
      return this.presenter.serverError('Erro ao buscar permissões da empresa');
    }
  }

  private async checkFeaturePermission(
    id_company: number,
    feature: FeatureType
  ): Promise<FeaturePermission> {
    const result = await this.checkCompanyFeatureLimits.execute({
      id_company,
      feature
    });

    return {
      canCreate: result.isWithinLimit,
      current: result.currentUsage,
      limit: result.limit,
      remaining: result.limit - result.currentUsage
    };
  }
}
