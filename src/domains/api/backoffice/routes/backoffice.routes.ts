import { Router } from 'express';
import { BackofficeSubscriptionPlansController } from '../controllers/subscription-plans.controller';
import { BackofficePaymentsController } from '../controllers/payments.controller';
import {
  backofficeAuth,
  backofficeAuditLog
} from '@middlewares/backoffice.middleware';

const backofficeRouter = Router();

// Aplicar middlewares de autenticação e auditoria para todas as rotas
backofficeRouter.use(backofficeAuth);
backofficeRouter.use(backofficeAuditLog);

// Instanciar controllers
const plansController = new BackofficeSubscriptionPlansController();
const paymentsController = new BackofficePaymentsController();

// ====== ROTAS DE PLANOS DE ASSINATURA ======

// Listar planos
backofficeRouter.get('/subscription-plans', (req, res) =>
  plansController.list(req, res)
);

// Buscar plano por ID
backofficeRouter.get('/subscription-plans/:id', (req, res) =>
  plansController.get(req, res)
);

// Criar novo plano
backofficeRouter.post('/subscription-plans', (req, res) =>
  plansController.create(req, res)
);

// Atualizar plano
backofficeRouter.put('/subscription-plans/:id', (req, res) =>
  plansController.update(req, res)
);

// Desativar plano
backofficeRouter.delete('/subscription-plans/:id', (req, res) =>
  plansController.delete(req, res)
);

// Sincronizar com Efí Pay
backofficeRouter.post('/subscription-plans/sync-efi', (req, res) =>
  plansController.syncWithEfi(req, res)
);

// Criar plano na Efí Pay
backofficeRouter.post('/subscription-plans/:id/create-efi-plan', (req, res) =>
  plansController.createEfiPlan(req, res)
);

// Testar conexão com Efí Pay
backofficeRouter.get('/subscription-plans/test-efi-connection', (req, res) =>
  plansController.testEfiConnection(req, res)
);

// ====== ROTAS DE PAGAMENTOS ======

// Listar pagamentos
backofficeRouter.get('/payments', (req, res) =>
  paymentsController.list(req, res)
);

// Pagamentos pendentes
backofficeRouter.get('/payments/pending', (req, res) =>
  paymentsController.listPending(req, res)
);

// Pagamentos em atraso
backofficeRouter.get('/payments/overdue', (req, res) =>
  paymentsController.listOverdue(req, res)
);

// Estatísticas de pagamentos
backofficeRouter.get('/payments/stats', (req, res) =>
  paymentsController.getStats(req, res)
);

// Buscar pagamento por ID
backofficeRouter.get('/payments/:id', (req, res) =>
  paymentsController.get(req, res)
);

// Sincronizar pagamento com Efí Pay
backofficeRouter.post('/payments/:id/sync-efi', (req, res) =>
  paymentsController.syncWithEfi(req, res)
);

// Sincronizar todos os pagamentos pendentes
backofficeRouter.post('/payments/sync-all-pending', (req, res) =>
  paymentsController.syncAllPending(req, res)
);

export { backofficeRouter };
