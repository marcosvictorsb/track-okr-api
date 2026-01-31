import { createLimiter } from '@configs/rate-limit';
import { Request, Response, Router } from 'express';
import {
  CreateLandingPageLeadController,
  GetLandingPageLeadController,
  UpdateLandingPageLeadController
} from '../controllers';
import { CreateLeadRequest } from '../controllers/create-landing-page-lead.controller';
import { UpdateLeadRequest } from '../controllers/update-landing-page-lead.controller';

const router = Router();
const createLeadController = new CreateLandingPageLeadController();
const getLeadController = new GetLandingPageLeadController();
const updateLeadController = new UpdateLandingPageLeadController();

router.post('/', createLimiter, (req: CreateLeadRequest, res: Response) =>
  createLeadController.createLead(req, res)
);

router.get('/leads', (req: Request, res: Response) =>
  getLeadController.getLeads(req, res)
);

router.get('/leads/:id', (req: Request, res: Response) =>
  getLeadController.getLeadById(req, res)
);

router.get('/leads/email/:email', (req: Request, res: Response) =>
  getLeadController.getLeadByEmail(req, res)
);

router.get('/leads-stats', (req: Request, res: Response) =>
  getLeadController.getLeadsStats(req, res)
);

router.put('/leads/:id', (req: UpdateLeadRequest, res: Response) =>
  updateLeadController.updateLeadStatus(req, res)
);

router.patch('/leads/:id/contacted', (req: Request, res: Response) =>
  updateLeadController.markAsContacted(req, res)
);

router.patch('/leads/:id/converted', (req: Request, res: Response) =>
  updateLeadController.markAsConverted(req, res)
);

router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    service: 'Landing Page Leads API',
    timestamp: new Date().toISOString()
  });
});

export default router;
