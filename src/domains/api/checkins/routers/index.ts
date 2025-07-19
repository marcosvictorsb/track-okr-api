import { Response, Router } from 'express';
import * as factories from '../factories/';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import { keyResultUpdateLimiter } from '@configs/rate-limit';
import { createResultKeyUpdateSchema } from '../schemas';

const { makeCreateResultKeyUpdateFactory, makeGetResultKeyUpdatesFactory } =
  factories;

const createResultKeyUpdateController = makeCreateResultKeyUpdateFactory();
const getResultKeyUpdatesController = makeGetResultKeyUpdatesFactory();

const router = Router();

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
