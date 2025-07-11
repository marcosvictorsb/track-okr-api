import { Response, Router } from 'express';
import * as factories from '../factories/';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import {
  validateFileUpload,
  handleUploadErrors
} from '@middlewares/upload.middleware';
import { createProfileSchema } from '../schemas';

const { makeCreateProfileFactory } = factories;

const createProfileController = makeCreateProfileFactory();

const router = Router();

router.post(
  '/',
  authMiddleware,
  validateFileUpload,
  validateSchema(createProfileSchema),
  (request: UserPayload, response: Response) =>
    createProfileController.createProfile(request, response),
  handleUploadErrors
);

export default router;
