import { HttpResponse } from '@protocols/http';
import {
  CreateResultKeyUpdateInteractorDependencies,
  InputCreateResultKeyUpdate,
  ICreateResultKeyUpdateGateway
} from '../interfaces/create-result-key-update.interface';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';

export class CreateResultKeyUpdateInteractor {
  protected gateway: ICreateResultKeyUpdateGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: CreateResultKeyUpdateInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  async execute(input: InputCreateResultKeyUpdate): Promise<HttpResponse> {
    try {
      const { id_result_key, new_value, comment, id_company, id_user } = input;

      this.gateway.loggerInfo(
        'Iniciando criação de atualização de resultado-chave',
        {
          requestTxt: JSON.stringify(input)
        }
      );

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

      // // Buscar o resultado-chave e validar se pertence à empresa
      const resultKey = await this.gateway.findResultKey({ id: id_result_key });
      if (!resultKey) {
        this.gateway.loggerInfo('Resultado-chave não encontrado', {
          id_company
        });
        return this.presenter.notFound('Resultado-chave não encontrado');
      }

      // Validar o novo valor
      if (new_value < 0) {
        this.gateway.loggerInfo('Valor inválido', { id_company });
        return this.presenter.badRequest(
          'O novo valor deve ser maior ou igual a zero'
        );
      }

      // Criar o registro de atualização
      const updateData = {
        id_result_key,
        previous_value: resultKey.current_value,
        new_value,
        comment: comment || null,
        id_user
      };

      const update = await this.gateway.createUpdate(updateData);

      if (!update) {
        this.gateway.loggerError('Erro ao criar atualização', {
          id_company
        });
        return this.presenter.serverError('Erro ao criar atualização');
      }

      // Atualizar o valor atual do resultado-chave
      const updated = await this.gateway.updateResultKeyCurrentValue(
        id_result_key,
        new_value
      );

      if (!updated) {
        this.gateway.loggerInfo(
          'Erro ao atualizar valor atual do resultado-chave',
          {
            id_result_key: id_result_key
          }
        );
        return this.presenter.serverError(
          'Erro ao atualizar valor do resultado-chave'
        );
      }

      this.gateway.loggerInfo('Atualização criada com sucesso', {
        id_company
      });

      return this.presenter.created({
        success: true,
        message: 'Atualização registrada com sucesso',
        data: {
          update: update.toJson(),
          previous_value: resultKey.current_value,
          new_value,
          difference: new_value - (resultKey.current_value || 0)
        }
      });
    } catch (error) {
      this.gateway.loggerError('Erro ao criar atualização de resultado-chave', {
        error: String(error)
      });
      return this.presenter.serverError('Erro ao criar atualização');
    }
  }
}
