import { Router } from 'express';
import { getSettingController } from '../factories';
import { authMiddleware } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import { getSettingSchema } from '../schemas';

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
  getSettingController.getSetting.bind(getSettingController)
);

export default router;
