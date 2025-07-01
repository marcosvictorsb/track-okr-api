import { Response, Router } from 'express';
import * as factories from '@domains/api/users/factories';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import { inviteUserSchema } from '../schemas';

const { activeUserController, inviteUserController } = factories;

const router = Router();

router.post(
  '/active',
  authMiddleware,
  (request: UserPayload, response: Response) =>
    activeUserController.activeUser(request, response)
);

router.post(
  '/invite',
  authMiddleware,
  validateSchema(inviteUserSchema),
  (request: UserPayload, response: Response) =>
    inviteUserController.inviteUser(request, response)
);

export default router;
