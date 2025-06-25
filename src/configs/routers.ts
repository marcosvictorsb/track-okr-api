import { Request, Response, Router } from 'express';
import routerMercadoPago from '@domains/webhooks/mercado-pago/routers';
import routerUser from '@domains/api/users/routers';
import authRoutes from '@domains/api/authentication/routes';
import plannerRouter from '@domains/api/planners/routers';

const routers = Router();

routers.get('/health-check', (request: Request, response: Response) => {
  response.status(200).json({ message: 'API is running' });
});

routers.use('/webhook', routerMercadoPago);
routers.use('/user', routerUser);
routers.use('/authenticate', authRoutes);
routers.use('/planner', plannerRouter);

const notFound = (request: Request, response: Response) => {
  response.status(404).json({ rota: 'Route does not exist' });
};
routers.use(notFound);

export default routers;
