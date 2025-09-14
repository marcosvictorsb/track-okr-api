import { MixCreateSupportContact } from '@adapters/gateways/api/support-contact';
import { logger } from '@configs/logger';
import { SupportContactEntity } from '../entity';
import {
  ICreateSupportContactGateway,
  ICreateSupportContactGatewayDependencies
} from '../interfaces';
import {
  CreateSupportContactCriteria,
  ISupportContactRepository
} from '../repository/support-contact.repository.interface';

export class CreateSupportContactGateway
  extends MixCreateSupportContact
  implements ICreateSupportContactGateway
{
  supportContactRepository: ISupportContactRepository;
  logging: typeof logger;

  constructor(params: ICreateSupportContactGatewayDependencies) {
    super(params);
    this.supportContactRepository = params.supportContactRepository;
    this.logging = params.logging;
  }

  async createSupportContact(
    data: CreateSupportContactCriteria
  ): Promise<SupportContactEntity> {
    this.logging.info('Criando novo contato de suporte', { data });
    return await this.supportContactRepository.create(data);
  }
}
