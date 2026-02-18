import * as factories from '@domains/api/exports/factories';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response, Router } from 'express';

const { makeCreateExportRequestController } = factories;

const createExportRequestController = makeCreateExportRequestController();

const router = Router();

router.post('/', authMiddleware, (request: UserPayload, response: Response) =>
  createExportRequestController.createExportRequest(request, response)
);

export default router;
