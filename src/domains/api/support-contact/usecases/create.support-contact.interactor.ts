import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  CreateSupportContactInteractorDependencies,
  ICreateSupportContactGateway,
  InputCreateSupportContact
} from '../interfaces';

export class CreateSupportContactInteractor {
  protected gateway: ICreateSupportContactGateway;
  protected presenter: IPresenter;

  constructor(params: CreateSupportContactInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  async execute(input: InputCreateSupportContact): Promise<HttpResponse> {
    try {
      const {
        user_id,
        company_id,
        contact_preference,
        contact_value,
        message,
        priority = 'medium',
        ip_address,
        user_agent,
        metadata,
        name
      } = input;

      this.gateway.loggerInfo('Iniciando criação de contato de suporte', {
        requestTxt: `name: ${name}, contact_preference: ${contact_preference}, priority: ${priority}`
      });

      const criteria = {
        user_id,
        company_id,
        name,
        contact_preference,
        contact_value,
        message,
        priority,
        status: 'new' as const,
        ip_address,
        user_agent,
        metadata
      };

      const supportContact = await this.gateway.createSupportContact(criteria);
      this.gateway.loggerInfo('Contato de suporte criado com sucesso', {
        requestTxt: `Support contact created with id: ${supportContact.id}`
      });

      return this.presenter.created(supportContact);
    } catch (error) {
      this.gateway.loggerError('Erro ao criar contato de suporte', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        id_company: input.company_id as number
      });
      return this.presenter.serverError('Erro ao criar contato de suporte');
    }
  }
}
