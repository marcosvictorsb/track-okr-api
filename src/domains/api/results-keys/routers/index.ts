import { Response, Router } from 'express';
import * as factories from '../factories/';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
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
  validateSchema(createResultKeySchema),
  (request: UserPayload, response: Response) =>
    createResultKeyController.createResultKey(request, response)
);

router.post(
  '/:id/updates',
  authMiddleware,
  validateSchema(createResultKeyUpdateSchema),
  (request: UserPayload, response: Response) =>
    createResultKeyUpdateController.createUpdate(request, response)
);

router.get(
  '/:id/updates',
  authMiddleware,
  (request: UserPayload, response: Response) =>
    getResultKeyUpdatesController.getKeyResultsUpdatesHistory(request, response)
);

export default router;
