import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import {
  UpdateResultKeyInteractorDependencies,
  IUpdateResultKeyGateway,
  InputUpdateResultKey
} from '../interfaces/update.result.key.interface';

export class UpdateResultKeyInteractor {
  protected gateway: IUpdateResultKeyGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: UpdateResultKeyInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  public async execute(input: InputUpdateResultKey): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Iniciando atualização do resultado-chave', {
        requestTxt: JSON.stringify(input)
      });

      const {
        id,
        id_company,
        id_user,
        current_value,
        initial_value,
        name,
        responsible_team_id,
        responsible_users,
        target_value,
        unit
      } = input;

      // Validar se o usuário pertence à empresa
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

      // Verificar se o resultado-chave existe
      const existingResultKey = await this.gateway.findResultKey({ id });
      if (!existingResultKey) {
        this.gateway.loggerInfo('Resultado-chave não encontrado', {
          data: `result_key_id: ${id}`
        });
        return this.presenter.notFound('Resultado-chave não encontrado');
      }

      const updateData: Partial<InputUpdateResultKey> = {
        name,
        initial_value,
        target_value,
        current_value,
        unit,
        responsible_users,
        responsible_team_id
      };
      const updatedResultKey = await this.gateway.updateResultKey(updateData, {
        id: existingResultKey.id as number
      });

      this.gateway.loggerInfo('Resultado-chave atualizado com sucesso', {
        data: `result_key_id: ${id}, updatedFields: ${Object.keys(updateData).join(', ')}`
      });

      return this.presenter.ok(updatedResultKey);
    } catch (error) {
      this.gateway.loggerError('Erro ao atualizar resultado-chave', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        requestTxt: JSON.stringify(input)
      });
      return this.presenter.serverError('Erro ao atualizar resultado-chave');
    }
  }
}
