import { Response, Router } from 'express';
import * as factories from '@domains/api/planners/factories';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import { createPlannerSchema } from '../schemas';

const { createPlannerController, getPlannerController } = factories;

const router = Router();

router.post(
  '/',
  authMiddleware,
  validateSchema(createPlannerSchema),
  (request: UserPayload, response: Response) =>
    createPlannerController.createPlanner(request, response)
);

router.get('/', authMiddleware, (request: UserPayload, response: Response) =>
  getPlannerController.getPlanner(request, response)
);

export default router;