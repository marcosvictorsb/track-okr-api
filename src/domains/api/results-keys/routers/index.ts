import { Response, Router } from 'express';
import * as factories from '../factories/';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import { keyResultCreationLimiter } from '@configs/rate-limit';
import { createResultKeySchema, updateResultKeySchema } from '../schemas';

const {
  makeCreateResultKeyFactory,
  makeDeleteResultKeyFactory,
  makeUpdateResultKeyFactory
} = factories;

const createResultKeyController = makeCreateResultKeyFactory();
const deleteResultKeyController = makeDeleteResultKeyFactory();
const updateResultKeyController = makeUpdateResultKeyFactory();

const router = Router();

router.post(
  '/',
  authMiddleware,
  keyResultCreationLimiter,
  validateSchema(createResultKeySchema),
  (request: UserPayload, response: Response) =>
    createResultKeyController.createResultKey(request, response)
);

router.put(
  '/:id',
  authMiddleware,
  validateSchema(updateResultKeySchema),
  (request: UserPayload, response: Response) =>
    updateResultKeyController.updateResultKey(request, response)
);

router.delete(
  '/:id',
  authMiddleware,
  (request: UserPayload, response: Response) =>
    deleteResultKeyController.handle(request, response)
);

export default router;
