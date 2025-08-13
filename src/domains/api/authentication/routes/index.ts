import { Router } from 'express';
import * as factories from '../factories';
import { validateSchema } from '@middlewares/validate.schema';
import {
  requestPasswordResetSchema,
  confirmPasswordResetSchema,
  registerFreeTrialSchema
} from '../schemas';

const {
  authenticationController,
  makeRequestPasswordResetController,
  makeConfirmPasswordResetController,
  makeRegisterFreeTrialController
} = factories;

const requestPasswordResetController = makeRequestPasswordResetController();
const confirmPasswordResetController = makeConfirmPasswordResetController();
const registerController = makeRegisterFreeTrialController();

const authRoutes = Router();

authRoutes.post('/', (request, response) =>
  authenticationController.authentication(request, response)
);

authRoutes.post(
  '/register',
  validateSchema(registerFreeTrialSchema),
  (request, response) => registerController.register(request, response)
);

authRoutes.post(
  '/reset-password',
  validateSchema(requestPasswordResetSchema),
  (request, response) =>
    requestPasswordResetController.requestPasswordReset(request, response)
);

authRoutes.post(
  '/confirm-password',
  validateSchema(confirmPasswordResetSchema),
  (request, response) =>
    confirmPasswordResetController.confirmPasswordReset(request, response)
);

export default authRoutes;
