import { Response, Router } from 'express';
import * as factories from '../factories/';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import {
  validateFileUpload,
  handleUploadErrors
} from '@middlewares/upload.middleware';
import { advancedFileValidation } from '@middlewares/file-validation.middleware';
import { uploadLimiter, createLimiter } from '@configs/rate-limit';
import { createProfileSchema } from '../schemas';

const { makeCreateProfileFactory, makeGetProfileFactory } = factories;

const createProfileController = makeCreateProfileFactory();
const getProfileController = makeGetProfileFactory();

const router = Router();

router.get('/', authMiddleware, (request: UserPayload, response: Response) =>
  getProfileController.getProfile(request, response)
);

router.post(
  '/',
  authMiddleware,
  uploadLimiter,
  createLimiter,
  validateFileUpload,
  advancedFileValidation,
  validateSchema(createProfileSchema),
  handleUploadErrors,
  (request: UserPayload, response: Response) =>
    createProfileController.createProfile(request, response)
);

export default router;
