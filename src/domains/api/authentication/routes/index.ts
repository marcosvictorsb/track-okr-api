import { validateSchema } from '@middlewares/validate.schema';
import { Router } from 'express';
import * as factories from '../factories';
import {
  confirmPasswordResetSchema,
  forgotPasswordSchema,
  registerBetaSchema,
  registerFreeTrialSchema,
  requestPasswordResetSchema
} from '../schemas';
import { changePasswordSchema } from '../schemas/change.password.schema';

const {
  authenticationController,
  makeRequestPasswordResetController,
  makeConfirmPasswordResetController,
  makeRegisterFreeTrialController,
  makeRegisterBetaController,
  makeForgotPasswordController,
  makeChangePasswordController
} = factories;

const requestPasswordResetController = makeRequestPasswordResetController();
const confirmPasswordResetController = makeConfirmPasswordResetController();
const registerController = makeRegisterFreeTrialController();
const registerBetaController = makeRegisterBetaController();
const forgotPasswordController = makeForgotPasswordController();
const changePasswordController = makeChangePasswordController();

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
  '/register-beta',
  validateSchema(registerBetaSchema),
  (request, response) => registerBetaController.registerBeta(request, response)
);

authRoutes.post(
  '/forgot-password',
  validateSchema(forgotPasswordSchema),
  (request, response) =>
    forgotPasswordController.forgotPassword(request, response)
);

authRoutes.post(
  '/change-password',
  validateSchema(changePasswordSchema),
  (request, response) =>
    changePasswordController.changePassword(request, response)
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
