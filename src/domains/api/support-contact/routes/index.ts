import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import { Response, Router } from 'express';
import { createSupportContactController } from '../factories';
import { createSupportContactSchema } from '../schemas';

const supportContactRoutes = Router();

supportContactRoutes.post(
  '/',
  validateSchema(createSupportContactSchema),
  authMiddleware,
  (request: UserPayload, response: Response) =>
    createSupportContactController.create(request, response)
);

export default supportContactRoutes;
