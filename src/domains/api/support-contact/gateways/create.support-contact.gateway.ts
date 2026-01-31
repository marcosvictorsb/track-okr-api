import { MixCreateSupportContact } from '@adapters/gateways/api/support-contact';
import { DiscordNotificationService } from '@adapters/services';
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
  discordNotificationService: DiscordNotificationService;
  logging: typeof logger;

  constructor(params: ICreateSupportContactGatewayDependencies) {
    super(params);
    this.supportContactRepository = params.supportContactRepository;
    this.discordNotificationService = params.discordNotificationService;
    this.logging = params.logging;
  }

  async createSupportContact(
    data: CreateSupportContactCriteria
  ): Promise<SupportContactEntity> {
    this.logging.info('Criando novo contato de suporte', { data });
    const supportContact = await this.supportContactRepository.create(data);

    await this.sendDiscordNotification(supportContact);

    return supportContact;
  }

  async sendDiscordNotification(
    supportData: SupportContactEntity
  ): Promise<void> {
    try {
      await this.discordNotificationService.sendSupportContactNotification({
        id: supportData.id,
        name: supportData.name || 'Não informado',
        contact_preference: supportData.contact_preference,
        contact_value: supportData.contact_value,
        message: supportData.message,
        priority: supportData.priority,
        company_id: supportData.company_id,
        user_id: supportData.user_id,
        created_at:
          supportData.created_at instanceof Date
            ? supportData.created_at
            : supportData.created_at
              ? new Date(supportData.created_at)
              : new Date()
      });
    } catch (error) {
      this.logging.error('Erro ao enviar notificação Discord para suporte', {
        error: (error as Error).message,
        support_id: supportData.id
      });
    }
  }
}
