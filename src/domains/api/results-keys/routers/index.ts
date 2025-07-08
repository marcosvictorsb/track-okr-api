import { Response, Router } from 'express';
import * as factories from '../factories/';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import { createResultKeySchema } from '../schemas';

const { makeCreateResultKeyFactory } = factories;

const createResultKeyController = makeCreateResultKeyFactory();

const router = Router();

router.post(
  '/key-results',
  authMiddleware,
  validateSchema(createResultKeySchema),
  (request: UserPayload, response: Response) =>
    createResultKeyController.createResultKey(request, response)
);

export default router;
