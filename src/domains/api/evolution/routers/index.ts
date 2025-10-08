import * as factories from '@domains/api/evolution/factories';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import { Response, Router } from 'express';
import { getEvolutionSchema, getKeyResultPeriodDetailSchema } from '../schemas';

const {
  makeGetEvolutionController,
  makeGetKeyResultPeriodDetailController,
  makeFiltersEvolutionController
} = factories;

const getEvolutionController = makeGetEvolutionController();
const getKeyResultPeriodDetailController =
  makeGetKeyResultPeriodDetailController();
const filtersEvolutionController = makeFiltersEvolutionController();

const router = Router();

// Buscar evolução de OKRs
router.get(
  '/',
  authMiddleware,
  validateSchema(getEvolutionSchema),
  (request: UserPayload, response: Response) =>
    getEvolutionController.getEvolution(request, response)
);

// Buscar detalhes de período de key result
router.get(
  '/key-result/:kr_id/period/:period',
  authMiddleware,
  validateSchema(getKeyResultPeriodDetailSchema),
  (request: UserPayload, response: Response) =>
    getKeyResultPeriodDetailController.getKeyResultPeriodDetail(
      request,
      response
    )
);

router.get(
  '/filters',
  authMiddleware,
  (request: UserPayload, response: Response) =>
    filtersEvolutionController.getFilters(request, response)
);

export default router;
