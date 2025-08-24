import { Response, Router } from 'express';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import { getSettingSchema, updateSettingSchema } from '../schemas';
import * as factories from '../factories';

const { getSettingController, updateSettingController } = factories;

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

/**
 * @route PUT /api/settings/:id
 * @description Atualiza as configurações da empresa
 * @access Private
 */
router.put(
  '/:id',
  authMiddleware,
  validateSchema(updateSettingSchema),
  (request: UserPayload, response: Response) =>
    updateSettingController.handle(request, response)
);

export default router;
