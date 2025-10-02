import { DiscordNotificationService } from '@adapters/services';
import { logger } from '@configs/logger';
import { Presenter } from '@protocols/presenter';
import { CreateSupportContactController } from '../controllers';
import { CreateSupportContactGateway } from '../gateways';
import SupportContactModel from '../model/support-contact.model';
import { SupportContactRepository } from '../repository/support-contact.repository';
import { CreateSupportContactInteractor } from '../usecases';

const supportContactRepository = new SupportContactRepository({
  model: SupportContactModel
});

// Instanciar o serviço Discord com a URL do webhook do suporte
const discordWebhookUrl =
  process.env.DISCORD_SUPPORT_WEBHOOK_URL ||
  'https://discord.com/api/webhooks/1423291754366369833/KA8sWZgvmT2cxkDtiFGlScB5Il7df5SG0-IlupTbeZUjT3oJrk8oP2BbWQCeb_aRHaJB';

const discordNotificationService = new DiscordNotificationService(
  discordWebhookUrl
);

const params = {
  logging: logger,
  supportContactRepository,
  discordNotificationService
};

const createSupportContactGateway = new CreateSupportContactGateway(params);

const interactor = new CreateSupportContactInteractor({
  gateway: createSupportContactGateway,
  presenter: new Presenter()
});

export const createSupportContactController =
  new CreateSupportContactController({
    interactor
  });
