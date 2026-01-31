import { objectiveCreationLimiter } from '@configs/rate-limit';
import * as factories from '@domains/api/objectives/factories';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import { Response, Router } from 'express';
import {
  createObjectiveSchema,
  deleteObjectiveSchema,
  getObjectiveSchema,
  updateObjectiveSchema
} from '../schemas';

const {
  makeCreateObjectiveController,
  makeGetObjectiveController,
  makeUpdateObjectiveController,
  makeDeleteObjectiveController
} = factories;

const getObjectiveController = makeGetObjectiveController();
const createObjectiveController = makeCreateObjectiveController();
const updateObjectiveController = makeUpdateObjectiveController();
const deleteObjectiveController = makeDeleteObjectiveController();

const router = Router();

router.post(
  '/',
  authMiddleware,
  objectiveCreationLimiter,
  validateSchema(createObjectiveSchema),
  (request: UserPayload, response: Response) =>
    createObjectiveController.createObjective(request, response)
);

router.get(
  '/',
  authMiddleware,
  validateSchema(getObjectiveSchema),
  (request: UserPayload, response: Response) =>
    getObjectiveController.getObjectives(request, response)
);

router.get('/:id', authMiddleware, (request: UserPayload, response: Response) =>
  getObjectiveController.getObjectives(request, response)
);

router.put(
  '/:id',
  authMiddleware,
  validateSchema(updateObjectiveSchema),
  (request: UserPayload, response: Response) =>
    updateObjectiveController.updateObjective(request, response)
);

router.delete(
  '/:id',
  authMiddleware,
  validateSchema(deleteObjectiveSchema),
  (request: UserPayload, response: Response) =>
    deleteObjectiveController.deleteObjective(request, response)
);

export default router;
