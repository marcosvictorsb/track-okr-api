import { Router, Request, Response } from 'express';
import {
  CreateLandingPageLeadController,
  GetLandingPageLeadController,
  UpdateLandingPageLeadController
} from '../controllers';
import { CreateLeadRequest } from '../controllers/create-landing-page-lead.controller';
import { UpdateLeadRequest } from '../controllers/update-landing-page-lead.controller';
import { createLimiter } from '@configs/rate-limit';

const router = Router();
const createLeadController = new CreateLandingPageLeadController();
const getLeadController = new GetLandingPageLeadController();
const updateLeadController = new UpdateLandingPageLeadController();

// Rota pública para capturar leads da landing page
router.post(
  '/leads',
  createLimiter, // Rate limiting para evitar spam
  (req: CreateLeadRequest, res: Response) =>
    createLeadController.createLead(req, res)
);

// Rotas protegidas para gerenciar leads (requer autenticação)
// TODO: Adicionar middleware de autenticação quando necessário

// Listar todos os leads com filtros e paginação
router.get('/leads', (req: Request, res: Response) =>
  getLeadController.getLeads(req, res)
);

// Buscar lead por ID
router.get('/leads/:id', (req: Request, res: Response) =>
  getLeadController.getLeadById(req, res)
);

// Buscar lead por email
router.get('/leads/email/:email', (req: Request, res: Response) =>
  getLeadController.getLeadByEmail(req, res)
);

// Estatísticas dos leads
router.get('/leads-stats', (req: Request, res: Response) =>
  getLeadController.getLeadsStats(req, res)
);

// Rotas de atualização de leads
// TODO: Adicionar middleware de autenticação

// Atualizar status e notas do lead
router.put('/leads/:id', (req: UpdateLeadRequest, res: Response) =>
  updateLeadController.updateLeadStatus(req, res)
);

// Marcar lead como contatado
router.patch('/leads/:id/contacted', (req: Request, res: Response) =>
  updateLeadController.markAsContacted(req, res)
);

// Marcar lead como convertido
router.patch('/leads/:id/converted', (req: Request, res: Response) =>
  updateLeadController.markAsConverted(req, res)
);

// Health check específico para landing page
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    service: 'Landing Page Leads API',
    timestamp: new Date().toISOString()
  });
});

export default router;
