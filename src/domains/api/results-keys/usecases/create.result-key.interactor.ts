import { UserCompanyValidationInteractor } from '@domains/common';
import {
  FeatureType,
  ICheckCompanyFeatureLimitsInteractor
} from '@domains/common/validations/interfaces/check.company.feature.limits.interface';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { ResultKeyStatus } from '../interfaces';
import {
  CreateResultKeyInteractorDependencies,
  ICreateResultKeyGateway,
  InputCreateResultKey
} from '../interfaces/create.result-key.interface';

export class CreateResultKeyInteractor {
  protected gateway: ICreateResultKeyGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;
  protected checkCompanyFeatureLimits: ICheckCompanyFeatureLimitsInteractor;

  constructor(params: CreateResultKeyInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
    this.checkCompanyFeatureLimits = params.checkCompanyFeatureLimits;
  }

  public async execute(input: InputCreateResultKey): Promise<HttpResponse> {
    try {
      const {
        name,
        initial_value,
        target_value,
        current_value,
        unit,
        responsible_team_id,
        responsible_users,
        id_okr,
        id_company,
        id_user
      } = input;

      this.gateway.loggerInfo('Iniciando criação do resultado-chave', {
        requestTxt: JSON.stringify(input)
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

      const currentUsage = await this.checkCompanyFeatureLimits.execute({
        id_company,
        feature: FeatureType.MAX_KEY_RESULTS_PER_OBJECTIVE,
        id_okr
      });

      this.gateway.loggerInfo('Verificação de limites concluída', {
        id_company,
        feature: FeatureType.MAX_KEY_RESULTS_PER_OBJECTIVE
      });

      if (!currentUsage.isWithinLimit) {
        this.gateway.loggerInfo(
          'Limite de resultado chave atingindo para a okr',
          {
            id_okr,
            id_company,
            feature: FeatureType.MAX_PLANNERS,
            requestTxt: JSON.stringify(currentUsage)
          }
        );
        return this.presenter.badRequest(
          'Limite de resultado chave atingido para este objetivo'
        );
      }

      const resultKey = await this.gateway.create({
        name,
        initial_value,
        target_value,
        current_value,
        unit,
        responsible_team_id: responsible_team_id || null,
        responsible_users:
          responsible_users && responsible_users.length > 0
            ? responsible_users
            : null,
        id_okr: id_okr,
        status: ResultKeyStatus.ACTIVE
      });

      this.gateway.loggerInfo('Resultado-chave criado com sucesso', {
        resultKeyId: resultKey.id
      });

      return this.presenter.created(resultKey);
    } catch (error) {
      this.gateway.loggerError('Erro ao criar o resultado-chave', { error });
      return this.presenter.serverError('Erro ao criar o resultado-chave');
    }
  }
}
