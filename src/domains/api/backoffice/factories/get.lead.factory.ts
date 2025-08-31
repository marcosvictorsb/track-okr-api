import { LandingPageLeadRepository } from '@domains/api/landing-page-leads/repository/landing-page-lead.repository';
import { GetLeadGateway } from '../gateway/get.lead.gateway';
import { GetLeadInteractor } from '../usecases/get.lead.interactor';
import { GetLeadController } from '../controllers/get.lead.controller';
import { logger } from '@configs/logger';
import { Presenter } from '@protocols/presenter';

// Repository
const leadRepository = new LandingPageLeadRepository();

// Gateway
const getLeadGateway = new GetLeadGateway({
  leadRepository,
  logging: logger
});

// Presenter
const presenter = new Presenter();

// Interactor
const getLeadInteractor = new GetLeadInteractor({
  gateway: getLeadGateway,
  presenter
});

// Controller
const getLeadController = new GetLeadController({
  interactor: getLeadInteractor
});

export { getLeadController };
