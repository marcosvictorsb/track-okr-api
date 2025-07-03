import { Response, Router } from 'express';
import * as factories from '../factories';
import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';

const {
  makeCreateUserTeamController,
  makeGetUserTeamController,
  makeUpdateUserTeamController,
  makeDeleteUserTeamController
} = factories;

const createUserTeamController = makeCreateUserTeamController();
const getUserTeamController = makeGetUserTeamController();
const updateUserTeamController = makeUpdateUserTeamController();
const deleteUserTeamController = makeDeleteUserTeamController();

const router = Router();

// GET - Buscar relacionamentos user-team
router.get('/', authMiddleware, (request: UserPayload, response: Response) =>
  getUserTeamController.getUserTeams(request, response)
);

// GET - Buscar usuários de um time específico
router.get(
  '/team/:id_team',
  authMiddleware,
  (request: UserPayload, response: Response) =>
    getUserTeamController.getUserTeamsByTeam(request, response)
);

// GET - Buscar times de um usuário específico
router.get(
  '/user/:id_user',
  authMiddleware,
  (request: UserPayload, response: Response) =>
    getUserTeamController.getUserTeamsByUser(request, response)
);

// POST - Adicionar usuário ao time
router.post(
  '/',
  authMiddleware,
  // validateSchema(createUserTeamSchema), // TODO: criar schema
  (request: UserPayload, response: Response) =>
    createUserTeamController.createUserTeam(request, response)
);

// PUT - Atualizar relacionamento user-team por ID
router.put(
  '/:id',
  authMiddleware,
  // validateSchema(updateUserTeamSchema), // TODO: criar schema
  (request: UserPayload, response: Response) =>
    updateUserTeamController.updateUserTeam(request, response)
);

// PUT - Atualizar relacionamento user-team por usuário e time
router.put(
  '/user/:id_user_to_update/team/:id_team',
  authMiddleware,
  // validateSchema(updateUserTeamSchema), // TODO: criar schema
  (request: UserPayload, response: Response) =>
    updateUserTeamController.updateUserTeamByUserAndTeam(request, response)
);

// DELETE - Remover relacionamento user-team por ID
router.delete(
  '/:id',
  authMiddleware,
  (request: UserPayload, response: Response) =>
    deleteUserTeamController.deleteUserTeam(request, response)
);

// DELETE - Remover usuário de time específico
router.delete(
  '/user/:id_user_to_remove/team/:id_team',
  authMiddleware,
  (request: UserPayload, response: Response) =>
    deleteUserTeamController.removeUserFromTeam(request, response)
);

// POST - Sair de um time (self-remove)
router.post(
  '/leave/:id_team',
  authMiddleware,
  (request: UserPayload, response: Response) =>
    deleteUserTeamController.leaveTeam(request, response)
);

export default router;
