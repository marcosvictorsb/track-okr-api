import * as factories from '@domains/api/information/factories';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response, Router } from 'express';

const { getInformationController } = factories;

const router = Router();

router.get('/', authMiddleware, (request: UserPayload, response: Response) =>
  getInformationController.getInformation(request, response)
);

export default router;
