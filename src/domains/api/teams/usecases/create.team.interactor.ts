import { HttpResponse } from '@protocols/http';
import {
  CreateTeamInteractorDependencies,
  InputCreateTeam,
  ICreateTeamGateway,
  AMOUNT_USERS_DEFAULT
} from '../interfaces';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import {
  FeatureType,
  ICheckCompanyFeatureLimitsInteractor
} from '@domains/common/validations/interfaces/check.company.feature.limits.interface';

export class CreateTeamInteractor {
  protected gateway: ICreateTeamGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;
  protected checkCompanyFeatureLimits: ICheckCompanyFeatureLimitsInteractor;

  constructor(params: CreateTeamInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
    this.checkCompanyFeatureLimits = params.checkCompanyFeatureLimits;
  }

  async execute(input: InputCreateTeam): Promise<HttpResponse> {
    try {
      const { name, description, id_company, id_user } = input;
      this.gateway.loggerInfo('Iniciando criação do time', {
        data: JSON.stringify({
          name,
          description,
          id_company
        })
      });

      // Validar usuário e empresa
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
        feature: FeatureType.MAX_TEAMS
      });

      this.gateway.loggerInfo('Verificação de limites concluída', {
        id_company,
        feature: FeatureType.MAX_TEAMS
      });

      if (!currentUsage.isWithinLimit) {
        this.gateway.loggerInfo('Limite de times atingido', {
          id_company,
          feature: FeatureType.MAX_TEAMS,
          requestTxt: JSON.stringify(currentUsage)
        });
        return this.presenter.badRequest('Limite de times atingido');
      }

      const criteria = {
        name,
        description,
        amount_users: AMOUNT_USERS_DEFAULT,
        id_company
      };
      const team = await this.gateway.createTeam(criteria);
      this.gateway.loggerInfo('Time criado com sucesso');

      return this.presenter.created(team);
    } catch (error) {
      this.gateway.loggerError('Erro ao criar o time', { error });
      return this.presenter.serverError('Erro ao criar o time');
    }
  }
}
