import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import { Router } from 'express';
import { getAnnualPlanningController } from '../factories/get.annual.planning.factory';
import { makeGetOverviewController } from '../factories/get.overview.factory';
import { getRecentCheckInsFactory } from '../factories/get.recent-checkins.factory';
import { getTeamPerformanceFactory } from '../factories/get.team.performance.factory';
import { getTemporalEvolutionFactory } from '../factories/get.temporal.evolution.factory';
import { getTopContributorsFactory } from '../factories/get.top.contributors.factory';
import { getAnnualPlanningSchema, getOverviewSchema } from '../schemas';
import { getRecentCheckInsSchema } from '../schemas/get.recent-checkins.schema';
import { getTeamPerformanceSchema } from '../schemas/get.team.performance.schema';
import { getTemporalEvolutionSchema } from '../schemas/get.temporal.evolution.schema';
import { getTopContributorsSchema } from '../schemas/get.top.contributors.schema';

const router = Router();

const getOverviewController = makeGetOverviewController();
const getTeamPerformanceController = getTeamPerformanceFactory().controller;
const getTopContributorsController = getTopContributorsFactory().controller;
const getTemporalEvolutionController = getTemporalEvolutionFactory().controller;
const getRecentCheckInsController = getRecentCheckInsFactory().controller;

router.get(
  '/overview',
  authMiddleware,
  validateSchema(getOverviewSchema),
  async (req: UserPayload, res) => {
    await getOverviewController.getOverview(req, res);
  }
);

router.get(
  '/team-performance',
  authMiddleware,
  validateSchema(getTeamPerformanceSchema),
  async (req: UserPayload, res) => {
    await getTeamPerformanceController.getTeamPerformance(req, res);
  }
);

router.get(
  '/contributors',
  authMiddleware,
  validateSchema(getTopContributorsSchema),
  async (req: UserPayload, res) => {
    await getTopContributorsController.getTopContributors(req, res);
  }
);

router.get(
  '/temporal-evolution',
  authMiddleware,
  validateSchema(getTemporalEvolutionSchema),
  async (req: UserPayload, res) => {
    await getTemporalEvolutionController.getTemporalEvolution(req, res);
  }
);

router.get(
  '/recent-checkins',
  authMiddleware,
  validateSchema(getRecentCheckInsSchema),
  async (req: UserPayload, res) => {
    await getRecentCheckInsController.getRecentCheckIns(req, res);
  }
);

router.get(
  '/annual-planning',
  authMiddleware,
  validateSchema(getAnnualPlanningSchema),
  async (req: UserPayload, res) => {
    await getAnnualPlanningController.getAnnualPlanning(req, res);
  }
);

export { router as dashboardRouter };
