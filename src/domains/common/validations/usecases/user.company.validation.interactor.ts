import {
  InputUserCompanyValidation,
  IUserCompanyValidationGateway,
  UserCompanyValidationInteractorDependencies,
  UserCompanyValidationResult
} from '../interfaces';

export class UserCompanyValidationInteractor {
  protected gateway: IUserCompanyValidationGateway;

  constructor(params: UserCompanyValidationInteractorDependencies) {
    this.gateway = params.gateway;
  }

  async execute(
    input: InputUserCompanyValidation
  ): Promise<UserCompanyValidationResult> {
    const { id_user, id_company } = input;

    const user = await this.gateway.findUser({ id: id_user });
    if (!user) {
      this.gateway.loggerInfo('Usuário não encontrado', { id_user });
      return {
        isValid: false
      };
    }

    if (user.id_company !== id_company) {
      this.gateway.loggerInfo(
        'Usuário não possui permissão para acessar recursos desta empresa',
        {
          id_company: user.id_company
        }
      );
      return {
        isValid: false
      };
    }

    return {
      isValid: true,
      user
    };
  }
}
