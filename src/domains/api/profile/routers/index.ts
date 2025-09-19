import { createLimiter, uploadLimiter } from '@configs/rate-limit';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { advancedFileValidation } from '@middlewares/file-validation.middleware';
import {
  handleUploadErrors,
  validateFileUpload
} from '@middlewares/upload.middleware';
import { validateSchema } from '@middlewares/validate.schema';
import { Response, Router } from 'express';
import * as factories from '../factories/';
import { createProfileSchema } from '../schemas';

const {
  makeCreateProfileFactory,
  makeGetProfileFactory,
  makeDeleteAvatarFactory
} = factories;

const createProfileController = makeCreateProfileFactory();
const getProfileController = makeGetProfileFactory();
const deleteAvatarController = makeDeleteAvatarFactory();

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

// Rota para deletar avatar
router.delete(
  '/avatar',
  authMiddleware,
  (request: UserPayload, response: Response) =>
    deleteAvatarController.deleteAvatar(request, response)
);

export default router;
