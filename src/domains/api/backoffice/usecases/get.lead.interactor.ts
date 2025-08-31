import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  GetLeadInteractorDependencies,
  IGetLeadGateway,
  InputGetLead
} from '../interfaces/get.lead.interfaces';
import { FindLandingPageLeadCriteria } from '@domains/api/landing-page-leads/interfaces/landing-page-lead.repository.interface';
import { LandingPageLeadEntity } from '@domains/api/landing-page-leads/entity/landing-page-lead.entity';

export class GetLeadInteractor {
  protected presenter: IPresenter;
  protected gateway: IGetLeadGateway;

  constructor(params: GetLeadInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  async execute(input: InputGetLead): Promise<HttpResponse> {
    this.gateway.loggerInfo('Case de uso listar leads iniciado', {
      data: JSON.stringify(input)
    });

    try {
      const {
        page = 1,
        limit = 20,
        status,
        source,
        company,
        company_size,
        utm_source,
        utm_medium,
        utm_campaign,
        email,
        dateFrom,
        dateTo
      } = input;

      // Validar parâmetros de paginação
      if (page < 1 || limit < 1 || limit > 100) {
        return this.presenter.badRequest(
          'Parâmetros de paginação inválidos. Page >= 1, Limit entre 1 e 100'
        );
      }

      // Construir critérios de busca
      const criteria: FindLandingPageLeadCriteria = {
        limit,
        offset: (page - 1) * limit
      };

      if (status) {
        criteria.status = status;
      }

      if (source) {
        criteria.source = source;
      }

      if (company) {
        criteria.company = company;
      }

      if (company_size) {
        criteria.company_size = company_size;
      }

      if (utm_source) {
        criteria.utm_source = utm_source;
      }

      if (utm_medium) {
        criteria.utm_medium = utm_medium;
      }

      if (utm_campaign) {
        criteria.utm_campaign = utm_campaign;
      }

      if (email) {
        criteria.email = email;
      }

      if (dateFrom) {
        criteria.created_after = new Date(dateFrom);
      }

      if (dateTo) {
        criteria.created_before = new Date(dateTo);
      }

      // Buscar leads
      const result = await this.gateway.findLeads(criteria);

      this.gateway.loggerInfo('Leads listados com sucesso', {
        data: `Total: ${result.total}, Page: ${page}, Limit: ${limit}`
      });

      return this.presenter.ok({
        leads: result.leads,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        },
        stats: this.calculateStats(result.leads)
      });
    } catch (error) {
      this.gateway.loggerError('Erro ao listar leads', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        data: JSON.stringify(input)
      });

      return this.presenter.serverError(
        'Erro interno do servidor ao listar leads'
      );
    }
  }

  private calculateStats(leads: LandingPageLeadEntity[]) {
    const stats = {
      total: leads.length,
      byStatus: {
        new: 0,
        contacted: 0,
        qualified: 0,
        converted: 0,
        lost: 0
      },
      bySource: {} as Record<string, number>,
      withCompany: 0,
      withPhone: 0,
      withUTM: 0
    };

    leads.forEach((lead) => {
      // Status count
      if (
        stats.byStatus[lead.status as keyof typeof stats.byStatus] !== undefined
      ) {
        stats.byStatus[lead.status as keyof typeof stats.byStatus]++;
      }

      // Source count
      if (lead.source) {
        stats.bySource[lead.source] = (stats.bySource[lead.source] || 0) + 1;
      }

      // Additional stats
      if (lead.company) stats.withCompany++;
      if (lead.phone) stats.withPhone++;
      if (lead.utm_source || lead.utm_medium || lead.utm_campaign)
        stats.withUTM++;
    });

    return stats;
  }
}
