import { Response, Router } from 'express';
import * as factories from '@domains/api/users/factories';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { validateSchema } from '@middlewares/validate.schema';
import { inviteUserSchema, updateUserSchema } from '../schemas';
import { deleteUserSchema } from '../schemas/delete.user';

const {
  activeUserController,
  inviteUserController,
  makeGetUserController,
  makeDeleteUserController,
  makeDeactivateUserController,
  makeUpdateUserController
} = factories;

const getUserController = makeGetUserController();
const deleteUserController = makeDeleteUserController();
const deactivateUserController = makeDeactivateUserController();
const updateUserController = makeUpdateUserController();

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

router.put(
  '/:id',
  authMiddleware,
  validateSchema(updateUserSchema),
  (request: UserPayload, response: Response) =>
    updateUserController.updateUser(request, response)
);

router.delete(
  '/:id',
  authMiddleware,
  validateSchema(deleteUserSchema),
  (request: UserPayload, response: Response) =>
    deleteUserController.deleteUser(request, response)
);

router.put(
  '/:id/deactivate',
  authMiddleware,
  (request: UserPayload, response: Response) =>
    deactivateUserController.deactivateUser(request, response)
);

export default router;
