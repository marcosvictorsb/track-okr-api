import { Router } from 'express';
import { makeGetDashboardOverviewController } from '../factories/get.dashboard.overview.factory';
import { getTeamPerformanceFactory } from '../factories/get.team.performance.factory';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import { getDashboardOverviewSchema } from '../schemas/get.dashboard.overview.schema';
import { getTeamPerformanceSchema } from '../schemas/get.team.performance.schema';

const router = Router();

const getDashboardOverviewController = makeGetDashboardOverviewController();
const getTeamPerformanceController = getTeamPerformanceFactory().controller;

// GET /api/dashboard/overview - Visão Geral do Trimestre
router.get(
  '/overview',
  authMiddleware,
  validateSchema(getDashboardOverviewSchema),
  async (req: UserPayload, res) => {
    await getDashboardOverviewController.getOverview(req, res);
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

export { router as dashboardRouter };
