import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  GetInformationInteractorDependencies,
  IGetInformationGateway,
  InputGetInformation
} from '../interfaces';

export class GetInformationInteractor {
  protected gateway: IGetInformationGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: GetInformationInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  async execute(input: InputGetInformation): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Iniciando a busca dos planejamentos anuais', {
        id_user: input.id_user,
        id_company: input.id_company
      });
      const { id_user, id_company } = input;

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

      const userTeam = await this.gateway.findUserTeam({ id: id_user });
      if (!userTeam) {
        this.gateway.loggerInfo('Usuário não pertence a nenhum time', {
          id_user
        });
        return this.presenter.ok({
          id_team: null
        });
      }

      return this.presenter.ok({
        id_team: userTeam[0].id_team
      });
    } catch (error) {
      this.gateway.loggerError('Erro ao criar o planejamento anual', { error });
      return this.presenter.serverError('Error ao criar o planejamento anual');
    }
  }
}
