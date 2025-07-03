import { Response, Router } from 'express';
import * as factories from '@domains/api/users/factories';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import { inviteUserSchema, getUserSchema } from '../schemas';
import { deleteUserSchema } from '../schemas/delete.user';

const {
  activeUserController,
  inviteUserController,
  makeGetUserController,
  makeDeleteUserController
} = factories;

const getUserController = makeGetUserController();
const deleteUserController = makeDeleteUserController();

const router = Router();

router.get(
  '/',
  authMiddleware,
  // validateSchema(getUserSchema),
  (request: UserPayload, response: Response) =>
    getUserController.getUsers(request, response)
);

router.post(
  '/active',
  authMiddleware,
  (request: UserPayload, response: Response) =>
    activeUserController.activeUser(request, response)
);

router.post(
  '/invite',
  authMiddleware,
  validateSchema(inviteUserSchema),
  (request: UserPayload, response: Response) =>
    inviteUserController.inviteUser(request, response)
);

router.delete(
  '/:id',
  authMiddleware,
  validateSchema(deleteUserSchema),
  (request: UserPayload, response: Response) =>
    deleteUserController.deleteUser(request, response)
);

export default router;
