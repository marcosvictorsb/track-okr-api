import { Response, Router } from 'express';
import * as factories from '../factories/';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import { keyResultCreationLimiter } from '@configs/rate-limit';
import { createResultKeySchema } from '../schemas';

const { makeCreateResultKeyFactory, makeDeleteResultKeyFactory } = factories;

const createResultKeyController = makeCreateResultKeyFactory();
const deleteResultKeyController = makeDeleteResultKeyFactory();

const router = Router();

router.post(
  '/',
  authMiddleware,
  keyResultCreationLimiter,
  validateSchema(createResultKeySchema),
  (request: UserPayload, response: Response) =>
    createResultKeyController.createResultKey(request, response)
);

router.delete(
  '/:id',
  authMiddleware,
  (request: UserPayload, response: Response) =>
    deleteResultKeyController.handle(request, response)
);

export default router;
