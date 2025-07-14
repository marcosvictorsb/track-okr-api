import { Request, Response, Router } from 'express';
import routerMercadoPago from '@domains/webhooks/mercado-pago/routers';
import routerUser from '@domains/api/users/routers';
import authRoutes from '@domains/api/authentication/routes';
import plannerRouter from '@domains/api/planners/routers';
import teamRouter from '@domains/api/teams/routers';
import objectiveRouter from '@domains/api/objectives/routers';
import resultKeyRoutes from '@domains/api/results-keys/routers';
import profileRouter from '@domains/api/profile/routers';
import healthRouter from '@domains/api/health/routers';

const routers = Router();

routers.get('/health-check', (request: Request, response: Response) => {
  response.status(200).json({ message: 'API is running' });
});

routers.use('/webhook', routerMercadoPago);
routers.use('/users', routerUser);
routers.use('/authenticate', authRoutes);
routers.use('/planners', plannerRouter);
routers.use('/teams', teamRouter);
routers.use('/objectives', objectiveRouter);
routers.use('/key-results', resultKeyRoutes);
routers.use('/profile', profileRouter);
routers.use('/api', healthRouter);

const notFound = (request: Request, response: Response) => {
  response.status(404).json({ rota: 'Route does not exist' });
};
routers.use(notFound);

export default routers;
