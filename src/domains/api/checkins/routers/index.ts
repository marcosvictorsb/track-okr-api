import { keyResultUpdateLimiter } from '@configs/rate-limit';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import { Response, Router } from 'express';
import * as factories from '../factories/';
import { createCheckinsSchema } from '../schemas';

const { makeCreateCheckinsFactory, makeGetCheckinsFactory } = factories;

const createCheckinsController = makeCreateCheckinsFactory();
const getCheckinssController = makeGetCheckinsFactory();

const router = Router();

router.post(
  '/:id/updates',
  authMiddleware,
  keyResultUpdateLimiter,
  validateSchema(createCheckinsSchema),
  (request: UserPayload, response: Response) =>
    createCheckinsController.createUpdate(request, response)
);

router.get(
  '/:id/updates',
  authMiddleware,
  (request: UserPayload, response: Response) =>
    getCheckinssController.getCheckins(request, response)
);

export default router;
