import { Router, Request, Response } from 'express';
// import { BackofficePaymentsController } from '../controllers/payments.controller';
import { BackofficeAuthController } from '../controllers/backoffice-auth.controller';
import { BackofficeAuthMiddleware } from '../../../../middlewares/backoffice-auth.middleware';
import { backofficeAuditLog } from '@middlewares/backoffice.middleware';
import * as factories from '../factories/index';

const backofficeRouter = Router();

// ====== CONTROLLERS ======
const {
  listPlanController,
  createPlanController,
  deletePlanController,
  getWebhookController,
  getLeadController
} = factories; // const paymentsController = new BackofficePaymentsController();
const authController = new BackofficeAuthController();

// ====== ROTAS DE AUTENTICAÇÃO (SEM MIDDLEWARE) ======
backofficeRouter.post('/auth/login', (req, res) =>
  authController.login(req, res)
);

backofficeRouter.post('/auth/refresh', (req, res) =>
  authController.refreshToken(req, res)
);

// ====== ROTAS PROTEGIDAS ======
// Aplicar middlewares de autenticação e auditoria para todas as rotas protegidas
backofficeRouter.use(BackofficeAuthMiddleware.requireAuth());
backofficeRouter.use(backofficeAuditLog);

// Rotas de autenticação que precisam de token
backofficeRouter.post('/auth/logout', (req, res) =>
  authController.logout(req, res)
);

backofficeRouter.get('/auth/me', (req, res) => authController.me(req, res));

backofficeRouter.get('/auth/verify', (req, res) =>
  authController.verifyToken(req, res)
);

// ====== ROTAS DE PLANOS DE ASSINATURA ======

// Listar planos (todos podem ver)
backofficeRouter.get('/plans', (request: Request, response: Response) =>
  listPlanController.listPlan(response)
);

// Criar novo plano (apenas manager e admin)
backofficeRouter.post(
  '/plans',
  BackofficeAuthMiddleware.requireManager(),
  (req, res) => createPlanController.create(req, res)
);

// Deletar plano (apenas admin)
backofficeRouter.delete(
  '/subscription-plans/:id',
  BackofficeAuthMiddleware.requireAdmin(),
  (req, res) => deletePlanController.delete(req, res)
);

// // Buscar plano por ID (todos podem ver)
// backofficeRouter.get('/-plans/:id', (req, res) =>
//   plansController.get(req, res)
// );

// // Testar conexão com Efí Pay (todos podem testar)
// backofficeRouter.get('/-plans/test-efi-connection', (req, res) =>
//   plansController.testEfiConnection(req, res)
// );

// Atualizar plano (apenas manager e admin)
// backofficeRouter.put(
//   '/-plans/:id',
//   BackofficeAuthMiddleware.requireManager(),
//   (req, res) => plansController.update(req, res)
// );

// // Desativar plano (apenas admin)
// backofficeRouter.delete(
//   '/-plans/:id',
//   BackofficeAuthMiddleware.requireAdmin(),
//   (req, res) => plansController.delete(req, res)
// );

// // Sincronizar com Efí Pay (apenas manager e admin)
// backofficeRouter.post(
//   '/-plans/sync-efi',
//   BackofficeAuthMiddleware.requireManager(),
//   (req, res) => plansController.syncWithEfi(req, res)
// );

// // Criar plano na Efí Pay (apenas manager e admin)
// backofficeRouter.post(
//   '/-plans/:id/create-efi-plan',
//   BackofficeAuthMiddleware.requireManager(),
//   (req, res) => plansController.createEfiPlan(req, res)
// );

// ====== ROTAS DE PAGAMENTOS ======

// Listar pagamentos (todos podem ver)
// backofficeRouter.get('/payments', (req, res) =>
//   paymentsController.list(req, res)
// );

// // Pagamentos pendentes (todos podem ver)
// backofficeRouter.get('/payments/pending', (req, res) =>
//   paymentsController.listPending(req, res)
// );

// // Pagamentos em atraso (todos podem ver)
// backofficeRouter.get('/payments/overdue', (req, res) =>
//   paymentsController.listOverdue(req, res)
// );

// // Estatísticas de pagamentos (todos podem ver)
// backofficeRouter.get('/payments/stats', (req, res) =>
//   paymentsController.getStats(req, res)
// );

// // Buscar pagamento por ID (todos podem ver)
// backofficeRouter.get('/payments/:id', (req, res) =>
//   paymentsController.get(req, res)
// );

// // Sincronizar pagamento com Efí Pay (apenas manager e admin)
// backofficeRouter.post(
//   '/payments/:id/sync-efi',
//   BackofficeAuthMiddleware.requireManager(),
//   (req, res) => paymentsController.syncWithEfi(req, res)
// );

// // Sincronizar todos os pagamentos pendentes (apenas admin)
// backofficeRouter.post(
//   '/payments/sync-all-pending',
//   BackofficeAuthMiddleware.requireAdmin(),
//   (req, res) => paymentsController.syncAllPending(req, res)
// );

// ====== ROTAS DE WEBHOOKS ======

// Listar webhooks (todos podem ver)
backofficeRouter.get('/webhooks', (req, res) =>
  getWebhookController.list(req, res)
);

// ====== ROTAS DE LEADS ======

// Listar leads da landing page (todos podem ver)
backofficeRouter.get('/leads', (req, res) => getLeadController.list(req, res));

export { backofficeRouter };
