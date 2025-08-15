import { Response, Router } from 'express';
import * as factories from '../factories/';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';

const { makeGetCompanyPermissionsController } = factories;

const getCompanyPermissionsController = makeGetCompanyPermissionsController();

const router = Router();

router.get(
  '/company/:id_company',
  authMiddleware,
  (request: UserPayload, response: Response) =>
    getCompanyPermissionsController.getCompanyPermissions(request, response)
);

export default router;
