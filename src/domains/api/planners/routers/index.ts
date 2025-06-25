import { Response, Router } from 'express';
import * as factories from '@domains/api/planners/factories';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';

const { createPlannerController } = factories;

const router = Router();

router.post('/', 
  authMiddleware,
  (request: UserPayload, response: Response) => createPlannerController.createPlanner(request, response)
);

export default router;