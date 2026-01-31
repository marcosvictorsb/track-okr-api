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

const discordWebhookUrl = process.env.DISCORD_SUPPORT_WEBHOOK_URL;

const discordNotificationService = new DiscordNotificationService(
  discordWebhookUrl as string
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
