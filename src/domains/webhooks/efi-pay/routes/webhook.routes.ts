import { Router } from 'express';
import { EfiWebhookController } from '../controllers/webhook.controller';

const efiWebhookRouter = Router();
const webhookController = new EfiWebhookController();

// Webhook da Efí Pay
efiWebhookRouter.post('/efi-pay', (req, res) =>
  webhookController.handleWebhook(req, res)
);

export default efiWebhookRouter;
