import {
  IGetLeadGateway,
  IGetLeadGatewayDependencies
} from '../interfaces/get.lead.interfaces';
import {
  FindLandingPageLeadCriteria,
  ILandingPageLeadRepository
} from '@domains/api/landing-page-leads/interfaces/landing-page-lead.repository.interface';
import { LandingPageLeadEntity } from '@domains/api/landing-page-leads/entity/landing-page-lead.entity';
import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';

export class GetLeadGateway implements IGetLeadGateway {
  protected leadRepository: ILandingPageLeadRepository;
  protected logging: typeof logger;

  constructor(params: IGetLeadGatewayDependencies) {
    this.leadRepository = params.leadRepository;
    this.logging = params.logging;
  }

  async findLeads(criteria: FindLandingPageLeadCriteria): Promise<{
    leads: LandingPageLeadEntity[];
    total: number;
  }> {
    // Buscar leads com os critérios
    const leads = await this.leadRepository.findAll(criteria);

    // Contar total sem paginação
    const totalCriteria = { ...criteria };
    delete totalCriteria.limit;
    delete totalCriteria.offset;
    const total = await this.leadRepository.count(totalCriteria);

    return {
      leads,
      total
    };
  }

  loggerInfo(message: string, data?: DataLogOutput): void {
    this.logging.info(message, data);
  }

  loggerError(message: string, data?: DataLogOutput): void {
    this.logging.error(message, data);
  }
}
