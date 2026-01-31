import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  ActivateUserPurchaseInteractorDependencies,
  IActivateUserPurchaseGateway,
  InputActivateUserPurchase
} from '../interfaces/activate.user.purchase.interface';
import { UserStatus } from '../interfaces/default.interfaces';

export class ActivateUserPurchaseInteractor {
  protected gateway: IActivateUserPurchaseGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: ActivateUserPurchaseInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  async execute(input: InputActivateUserPurchase): Promise<HttpResponse> {
    try {
      const {
        company_document,
        company_name,
        email,
        id_company,
        id_user,
        password
      } = input;

      this.gateway.loggerInfo('Iniciando ativação do usuário', {
        data: JSON.stringify({ id_company, id_user, company_name })
      });

      const validation = await this.userCompanyValidator.execute({
        id_user,
        id_company
      });

      if (!validation.isValid) {
        this.gateway.loggerError('O usuário ou empresa não é válido', {
          id_company,
          id_user
        });
        return this.presenter.badRequest('O usuário ou empresa não é válido');
      }

      const user = await this.gateway.findUser({ id: id_user });
      if (!user) {
        this.gateway.loggerInfo('Usuário solicitante não encontrado', {
          id_user
        });
        return this.presenter.notFound('Usuário não encontrado');
      }

      if (user.status === UserStatus.ACTIVE) {
        this.gateway.loggerInfo('Usuário já está ativo', { id_user });
        return this.presenter.conflict('Usuário já está ativo');
      }

      const updateData = {
        email,
        status: UserStatus.ACTIVE,
        password_hash: this.gateway.encryptPassword(password)
      };
      await this.gateway.updateUser(updateData, {
        id: id_user
      });

      const company = await this.gateway.findCompany({ id: id_company });
      if (!company) {
        this.gateway.loggerInfo('Empresa não encontrada', { id_company });
        return this.presenter.notFound('Empresa não encontrada');
      }

      const updateDataCompany = {
        name: company_name,
        cnpj: company_document
      };
      await this.gateway.updateCompany(updateDataCompany, { id: id_company });

      return this.presenter.ok({
        message: 'Usuário ativado com sucesso'
      });
    } catch (error) {
      this.gateway.loggerError('Erro ao ativar o usuário', {
        error: (error as Error).message,
        stack: (error as Error).stack
      });
      return this.presenter.serverError('Erro ao ativar o usuário');
    }
  }
}
