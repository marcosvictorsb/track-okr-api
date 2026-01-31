import { Request, Response, Router } from 'express';
import memoryRouter from './memory';

const router = Router();

router.use(memoryRouter);

router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV as string
  });
});

export default router;
