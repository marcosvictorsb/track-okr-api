import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response, Router } from 'express';
import * as factories from '../factories/';

const { makeGetCompanyPermissionsController } = factories;

const getCompanyPermissionsController = makeGetCompanyPermissionsController();

const router = Router();

router.get('/', authMiddleware, (request: UserPayload, response: Response) =>
  getCompanyPermissionsController.getCompanyPermissions(request, response)
);

export default router;
