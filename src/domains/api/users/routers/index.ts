import { Response, Router } from 'express';
import * as factories from '@domains/api/users/factories';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';

const { activeUserController } = factories;

const router = Router();

router.post('/active', 
  authMiddleware,
  (request: UserPayload, response: Response) => activeUserController.activeUser(request, response)
);

export default router;