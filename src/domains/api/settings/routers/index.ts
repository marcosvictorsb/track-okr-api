import { Response, Router } from 'express';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import { getSettingSchema } from '../schemas';
import * as factories from '../factories';

const { getSettingController } = factories;

const router = Router();

/**
 * @route GET /api/settings
 * @description Busca as configurações da empresa
 * @access Private
 */
router.get(
  '/',
  authMiddleware,
  validateSchema(getSettingSchema),
  (request: UserPayload, response: Response) =>
    getSettingController.getSetting(request, response)
);

export default router;
