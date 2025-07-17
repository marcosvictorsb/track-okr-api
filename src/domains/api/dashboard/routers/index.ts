import { Router } from 'express';
import { makeGetOverviewController } from '../factories/get.overview.factory';
import { getTeamPerformanceFactory } from '../factories/get.team.performance.factory';
import { getTopContributorsFactory } from '../factories/get.top.contributors.factory';
import { getTemporalEvolutionFactory } from '../factories/get.temporal.evolution.factory';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import { getTeamPerformanceSchema } from '../schemas/get.team.performance.schema';
import { getTopContributorsSchema } from '../schemas/get.top.contributors.schema';
import { getTemporalEvolutionSchema } from '../schemas/get.temporal.evolution.schema';
import { getOverviewSchema } from '../schemas';

const router = Router();

const getOverviewController = makeGetOverviewController();
const getTeamPerformanceController = getTeamPerformanceFactory().controller;
const getTopContributorsController = getTopContributorsFactory().controller;
const getTemporalEvolutionController = getTemporalEvolutionFactory().controller;

// GET /api/dashboard/overview - Visão Geral do Trimestre
router.get(
  '/overview',
  authMiddleware,
  validateSchema(getOverviewSchema),
  async (req: UserPayload, res) => {
    await getOverviewController.getOverview(req, res);
  }
);

// GET /api/dashboard/teams - Desempenho por Time
router.get(
  '/team-performance',
  authMiddleware,
  validateSchema(getTeamPerformanceSchema),
  async (req: UserPayload, res) => {
    await getTeamPerformanceController.getTeamPerformance(req, res);
  }
);

// GET /api/dashboard/contributors - Top Contribuidores
router.get(
  '/contributors',
  authMiddleware,
  validateSchema(getTopContributorsSchema),
  async (req: UserPayload, res) => {
    await getTopContributorsController.getTopContributors(req, res);
  }
);

// GET /api/dashboard/temporal-evolution - Evolução Temporal
router.get(
  '/temporal-evolution',
  authMiddleware,
  validateSchema(getTemporalEvolutionSchema),
  async (req: UserPayload, res) => {
    await getTemporalEvolutionController.getTemporalEvolution(req, res);
  }
);

export { router as dashboardRouter };
