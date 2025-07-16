import { Router } from 'express';
import { makeGetDashboardOverviewController } from '../factories/get.dashboard.overview.factory';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import { getDashboardOverviewSchema } from '../schemas/get.dashboard.overview.schema';

const router = Router();

const getDashboardOverviewController = makeGetDashboardOverviewController();

// GET /api/dashboard/overview - Visão Geral do Trimestre
router.get(
  '/overview',
  authMiddleware,
  validateSchema(getDashboardOverviewSchema),
  async (req: UserPayload, res) => {
    await getDashboardOverviewController.getOverview(req, res);
  }
);

export { router as dashboardRouter };
