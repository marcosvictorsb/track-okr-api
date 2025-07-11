import { Response, Router } from 'express';
import * as factories from '../factories/';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import {
  keyResultCreationLimiter,
  keyResultUpdateLimiter
} from '@configs/rate-limit';
import { createResultKeySchema, createResultKeyUpdateSchema } from '../schemas';

const {
  makeCreateResultKeyFactory,
  makeCreateResultKeyUpdateFactory,
  makeGetResultKeyUpdatesFactory
} = factories;

const createResultKeyController = makeCreateResultKeyFactory();
const createResultKeyUpdateController = makeCreateResultKeyUpdateFactory();
const getResultKeyUpdatesController = makeGetResultKeyUpdatesFactory();

const router = Router();

router.post(
  '/',
  authMiddleware,
  keyResultCreationLimiter,
  validateSchema(createResultKeySchema),
  (request: UserPayload, response: Response) =>
    createResultKeyController.createResultKey(request, response)
);

router.post(
  '/:id/updates',
  authMiddleware,
  keyResultUpdateLimiter,
  validateSchema(createResultKeyUpdateSchema),
  (request: UserPayload, response: Response) =>
    createResultKeyUpdateController.createUpdate(request, response)
);

router.get(
  '/:id/updates',
  authMiddleware,
  (request: UserPayload, response: Response) =>
    getResultKeyUpdatesController.getKeyResultUpdate(request, response)
);

export default router;
