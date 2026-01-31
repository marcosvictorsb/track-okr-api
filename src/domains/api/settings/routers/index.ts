import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import { Response, Router } from 'express';
import * as factories from '../factories';
import {
  createSettingSchema,
  getSettingSchema,
  updateSettingSchema
} from '../schemas';

const {
  getSettingController,
  updateSettingController,
  createSettingController
} = factories;

const router = Router();

router.get(
  '/',
  authMiddleware,
  validateSchema(getSettingSchema),
  (request: UserPayload, response: Response) =>
    getSettingController.getSetting(request, response)
);

router.post(
  '/',
  authMiddleware,
  validateSchema(createSettingSchema),
  (request: UserPayload, response: Response) =>
    createSettingController.handle(request, response)
);

router.put(
  '/:id',
  authMiddleware,
  validateSchema(updateSettingSchema),
  (request: UserPayload, response: Response) =>
    updateSettingController.handle(request, response)
);

export default router;
