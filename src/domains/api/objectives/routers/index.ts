import { Response, Router } from 'express';
import * as factories from '@domains/api/objectives/factories';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import {
  createObjectiveSchema,
  updateObjectiveSchema,
  getObjectiveSchema,
  deleteObjectiveSchema
} from '../schemas';

const {
  createObjectiveController,
  getObjectiveController,
  updateObjectiveController,
  deleteObjectiveController
} = factories;

const router = Router();

// Criar objetivo
router.post(
  '/',
  authMiddleware,
  validateSchema(createObjectiveSchema),
  (request: UserPayload, response: Response) =>
    createObjectiveController.createObjective(request, response)
);

// Buscar objetivos
router.get(
  '/',
  authMiddleware,
  validateSchema(getObjectiveSchema),
  (request: UserPayload, response: Response) =>
    getObjectiveController.getObjectives(request, response)
);

// Buscar objetivo por ID
router.get('/:id', authMiddleware, (request: UserPayload, response: Response) =>
  getObjectiveController.getObjectives(request, response)
);

// Atualizar objetivo
router.put(
  '/:id',
  authMiddleware,
  validateSchema(updateObjectiveSchema),
  (request: UserPayload, response: Response) =>
    updateObjectiveController.updateObjective(request, response)
);

// Deletar objetivo
router.delete(
  '/:id',
  authMiddleware,
  validateSchema(deleteObjectiveSchema),
  (request: UserPayload, response: Response) =>
    deleteObjectiveController.deleteObjective(request, response)
);

export default router;
