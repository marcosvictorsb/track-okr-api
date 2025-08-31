import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { IPresenter } from '@protocols/presenter';
import { GetLeadInteractor } from '../usecases';
import { LandingPageLeadEntity } from '@domains/api/landing-page-leads/entity/landing-page-lead.entity';
import {
  FindLandingPageLeadCriteria,
  ILandingPageLeadRepository
} from '@domains/api/landing-page-leads/interfaces/landing-page-lead.repository.interface';

export type InputGetLead = {
  page?: number;
  limit?: number;
  status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source?: string;
  company?: string;
  company_size?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  email?: string;
  dateFrom?: string;
  dateTo?: string;
};

export interface IGetLeadGateway {
  findLeads(criteria: FindLandingPageLeadCriteria): Promise<{
    leads: LandingPageLeadEntity[];
    total: number;
  }>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IGetLeadGatewayDependencies {
  leadRepository: ILandingPageLeadRepository;
  logging: typeof logger;
}

export type GetLeadInteractorDependencies = {
  gateway: IGetLeadGateway;
  presenter: IPresenter;
};

export type GetLeadControllerDependencies = {
  interactor: GetLeadInteractor;
};
