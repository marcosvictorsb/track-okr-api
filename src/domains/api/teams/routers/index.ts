import { createLimiter } from '@configs/rate-limit';
import * as factories from '@domains/api/teams/factories';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import { Response, Router } from 'express';
import { createTeamSchema, updateTeamSchema } from '../schemas';

const {
  createTeamController,
  getTeamController,
  updateTeamController,
  deleteTeamController
} = factories;

const router = Router();

router.post(
  '/',
  authMiddleware,
  createLimiter,
  validateSchema(createTeamSchema),
  (request: UserPayload, response: Response) =>
    createTeamController.createTeam(request, response)
);

router.get('/', authMiddleware, (request: UserPayload, response: Response) =>
  getTeamController.getTeam(request, response)
);

router.put(
  '/:id',
  authMiddleware,
  validateSchema(updateTeamSchema),
  (request: UserPayload, response: Response) =>
    updateTeamController.updateTeam(request, response)
);

router.delete(
  '/:id',
  authMiddleware,
  (request: UserPayload, response: Response) =>
    deleteTeamController.deleteTeam(request, response)
);

export default router;
