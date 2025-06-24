import { Router } from 'express';
import * as factories from '../factories';

const { authenticationController } = factories;

const authRoutes = Router();

authRoutes.post('/', (request, response) =>
  authenticationController.authentication(request, response)
);

export default authRoutes;
