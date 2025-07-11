import { Response, Router } from 'express';
import * as factories from '../factories/';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import {
  validateFileUpload,
  handleUploadErrors
} from '@middlewares/upload.middleware';
import { createProfileSchema } from '../schemas';

const { makeCreateProfileFactory, makeGetProfileFactory } = factories;

const createProfileController = makeCreateProfileFactory();
const getProfileController = makeGetProfileFactory();

const router = Router();

// GET /profile - Buscar perfil do usuário
router.get('/', authMiddleware, (request: UserPayload, response: Response) =>
  getProfileController.getProfile(request, response)
);

// POST /profile - Criar/atualizar perfil do usuário
router.post(
  '/',
  authMiddleware,
  validateFileUpload,
  validateSchema(createProfileSchema),
  handleUploadErrors,
  (request: UserPayload, response: Response) =>
    createProfileController.createProfile(request, response)
);

export default router;
