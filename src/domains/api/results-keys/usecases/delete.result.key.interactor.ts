import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import {
  DeleteResultKeyInteractorDependencies,
  IDeleteResultKeyGateway,
  InputDeleteResultKey
} from '../interfaces/delete.result.key.interface';

export class DeleteResultKeyInteractor {
  protected gateway: IDeleteResultKeyGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: DeleteResultKeyInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  public async execute(input: InputDeleteResultKey): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Iniciando a deleção do resultado-chave', {
        requestTxt: JSON.stringify(input)
      });
      const { id, id_company, id_user } = input;

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

      const resultKey = await this.gateway.findResultKey({ id });
      if (!resultKey) {
        this.gateway.loggerInfo('Resultado-chave não encontrado', { id });
        return this.presenter.notFound('Resultado-chave não encontrado');
      }

      await this.gateway.deleteResultKey({ id });

      this.gateway.loggerInfo(
        'Deleção do resultado-chave realizada com sucesso',
        { id }
      );
      return this.presenter.ok();
    } catch (error) {
      this.gateway.loggerError('Erro ao criar o resultado-chave', { error });
      return this.presenter.serverError('Erro ao criar o resultado-chave');
    }
  }
}
