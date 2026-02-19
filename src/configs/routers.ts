import authRoutes from '@domains/api/authentication/routes';
import { backofficeRouter } from '@domains/api/backoffice/routes/backoffice.routes';
import checkInsRouters from '@domains/api/checkins/routers';
import { dashboardRouter } from '@domains/api/dashboard/routers';
import evolutionRouter from '@domains/api/evolution/routers';
import { exportRequestsRouter } from '@domains/api/exports';
import healthRouter from '@domains/api/health/routers';
import informationRouter from '@domains/api/information/routers';
import leadRouter from '@domains/api/landing-page-leads/routers';
import objectiveRouter from '@domains/api/objectives/routers';
import permissionsRouter from '@domains/api/permissions/routers';
import plannerRouter from '@domains/api/planners/routers';
import profileRouter from '@domains/api/profile/routers';
import resultKeyRoutes from '@domains/api/results-keys/routers';
import settingRouter from '@domains/api/settings/routers';
import { subscriptionRoutes } from '@domains/api/subscription/routes';
import supportContactRoutes from '@domains/api/support-contact/routes';
import teamRouter from '@domains/api/teams/routers';
import routerUser from '@domains/api/users/routers';
import caktoWebhookRouter from '@domains/webhooks/cakto/routers';
import { Request, Response, Router } from 'express';

const routers = Router();

routers.get('/health-check', (request: Request, response: Response) => {
  response.status(200).json({ message: 'API is running' });
});
routers.use('/api', healthRouter);
routers.use('/webhook', caktoWebhookRouter);
routers.use('/users', routerUser);
routers.use('/authenticate', authRoutes);
routers.use('/planners', plannerRouter);
routers.use('/informations', informationRouter);
routers.use('/teams', teamRouter);
routers.use('/objectives', objectiveRouter);
routers.use('/key-results', resultKeyRoutes);
routers.use('/checkins', checkInsRouters);
routers.use('/profile', profileRouter);
routers.use('/leads', leadRouter);
routers.use('/dashboard', dashboardRouter);
routers.use('/evolution', evolutionRouter);
routers.use('/settings', settingRouter);
routers.use('/permissions', permissionsRouter);
routers.use('/subscription', subscriptionRoutes);
routers.use('/support-contact', supportContactRoutes);
routers.use('/exports', exportRequestsRouter);
routers.use('/backoffice', backofficeRouter);

const notFound = (request: Request, response: Response) => {
  response.status(404).json({ rota: 'Route does not exist' });
};
routers.use(notFound);

export default routers;
