import { Request, Response, Router } from 'express';
import routerMercadoPago from '@domains/webhooks/mercado-pago/routers';
import routerUser from '@domains/api/users/routers';
import authRoutes from '@domains/api/authentication/routes';
import plannerRouter from '@domains/api/planners/routers';
import teamRouter from '@domains/api/teams/routers';
import objectiveRouter from '@domains/api/objectives/routers';
import resultKeyRoutes from '@domains/api/results-keys/routers';
import checkInsRouters from '@domains/api/checkins/routers';
import profileRouter from '@domains/api/profile/routers';
import healthRouter from '@domains/api/health/routers';
import leadRouter from '@domains/api/landing-page-leads/routers';
import { dashboardRouter } from '@domains/api/dashboard/routers';
import settingRouter from '@domains/api/settings/routers';

const routers = Router();

routers.get('/health-check', (request: Request, response: Response) => {
  response.status(200).json({ message: 'API is running' });
});
routers.use('/api', healthRouter);
routers.use('/webhook', routerMercadoPago);
routers.use('/users', routerUser);
routers.use('/authenticate', authRoutes);
routers.use('/planners', plannerRouter);
routers.use('/teams', teamRouter);
routers.use('/objectives', objectiveRouter);
routers.use('/key-results', resultKeyRoutes);
routers.use('/checkins', checkInsRouters);
routers.use('/profile', profileRouter);
routers.use('/leads', leadRouter);
routers.use('/dashboard', dashboardRouter);
routers.use('/settings', settingRouter);

const notFound = (request: Request, response: Response) => {
  response.status(404).json({ rota: 'Route does not exist' });
};
routers.use(notFound);

export default routers;
