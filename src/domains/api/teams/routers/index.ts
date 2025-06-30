import { Response, Router } from 'express';
import * as factories from '@domains/api/teams/factories';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import { createTeamSchema } from '../schemas';

const { createTeamController } = factories;

const router = Router();

router.post(
  '/',
  authMiddleware,
  validateSchema(createTeamSchema),
  (request: UserPayload, response: Response) =>
    createTeamController.createTeam(request, response)
);

export default router;
