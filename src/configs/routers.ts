import { Request, Response, Router } from 'express';
import routerMercadoPago from '@domains/webhooks/mercado-pago/routers';

const routers = Router();

routers.get('/health-check', (request: Request, response: Response) => {
  response.status(200).json({ message: 'API is running' });
});

routers.use('/webhook', routerMercadoPago);
// routers.use('/projects', projectRoutes);
// routers.use('/authenticate', authRoutes);
// routers.use('/feature-flags', featureFlagRoutes);

const notFound = (request: Request, response: Response) => {
  response.status(404).json({ rota: 'Route does not exist' });
};
routers.use(notFound);

export default routers;
