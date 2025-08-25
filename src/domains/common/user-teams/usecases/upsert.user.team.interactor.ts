import {
  UpsertUserTeamInteractorDependencies,
  InputUpsertUserTeam,
  IUpsertUserTeamGateway
} from '../interfaces';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';

export class UpsertUserTeamInteractor {
  protected gateway: IUpsertUserTeamGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: UpsertUserTeamInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  async execute(input: InputUpsertUserTeam): Promise<void> {
    this.gateway.loggerInfo('Iniciando adição de usuário ao time', {
      requestTxt: JSON.stringify(input)
    });

    const { id_team, id_user } = input;

    // Criar o relacionamento ou atualizar se ja existir atualizar
    await this.gateway.upsertUserTeam({
      id_user,
      id_team,
      role_in_team: 'member'
    });

    this.gateway.loggerInfo('Relacionamento atualizado de usuário com o time');
  }
}
