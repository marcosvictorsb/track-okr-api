import { Request, Response } from 'express';
import { LandingPageLeadRepository } from '../repository/landing-page-lead.repository';
import { FindLandingPageLeadCriteria } from '../interfaces/landing-page-lead.repository.interface';
import { logger } from '@configs/logger';

export class GetLandingPageLeadController {
  private leadRepository: LandingPageLeadRepository;

  constructor() {
    this.leadRepository = new LandingPageLeadRepository();
  }

  async getLeads(req: Request, res: Response): Promise<Response> {
    try {
      const { status, company, source, limit = 50, offset = 0 } = req.query;

      const criteria: FindLandingPageLeadCriteria = {};

      if (status) {
        const validStatuses = [
          'new',
          'contacted',
          'qualified',
          'converted',
          'lost'
        ];
        if (validStatuses.includes(status as string)) {
          criteria.status = status as
            | 'new'
            | 'contacted'
            | 'qualified'
            | 'converted'
            | 'lost';
        }
      }
      if (company) criteria.company = company as string;
      if (source) criteria.source = source as string;
      if (limit) criteria.limit = parseInt(limit as string);
      if (offset) criteria.offset = parseInt(offset as string);

      const leads = await this.leadRepository.findAll(criteria);
      const total = await this.leadRepository.count(criteria);

      return res.status(200).json({
        success: true,
        data: leads,
        pagination: {
          total,
          limit: criteria.limit || 50,
          offset: criteria.offset || 0,
          has_more: (criteria.offset || 0) + leads.length < total
        }
      });
    } catch (error) {
      logger.error('Erro ao buscar leads', {
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async getLeadById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID do lead é obrigatório e deve ser um número válido'
        });
      }

      const lead = await this.leadRepository.findById(parseInt(id));

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead não encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        data: lead
      });
    } catch (error) {
      logger.error('Erro ao buscar lead por ID', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        leadId: req.params.id
      });

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async getLeadByEmail(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email é obrigatório'
        });
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de email inválido'
        });
      }

      const lead = await this.leadRepository.findByEmail(email);

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead não encontrado com este email'
        });
      }

      return res.status(200).json({
        success: true,
        data: lead
      });
    } catch (error) {
      logger.error('Erro ao buscar lead por email', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        email: req.params.email
      });

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async getLeadsStats(req: Request, res: Response): Promise<Response> {
    try {
      // Buscar estatísticas dos leads
      const totalLeads = await this.leadRepository.count();
      const newLeads = await this.leadRepository.count({ status: 'new' });
      const contactedLeads = await this.leadRepository.count({
        status: 'contacted'
      });
      const qualifiedLeads = await this.leadRepository.count({
        status: 'qualified'
      });
      const convertedLeads = await this.leadRepository.count({
        status: 'converted'
      });
      const lostLeads = await this.leadRepository.count({ status: 'lost' });

      // Buscar leads dos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentLeads = await this.leadRepository.count({
        created_after: thirtyDaysAgo
      });

      // Buscar leads de hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayLeads = await this.leadRepository.count({
        created_after: today
      });

      return res.status(200).json({
        success: true,
        data: {
          total_leads: totalLeads,
          status_breakdown: {
            new: newLeads,
            contacted: contactedLeads,
            qualified: qualifiedLeads,
            converted: convertedLeads,
            lost: lostLeads
          },
          recent_activity: {
            last_30_days: recentLeads,
            today: todayLeads
          },
          conversion_rate:
            totalLeads > 0
              ? ((convertedLeads / totalLeads) * 100).toFixed(2)
              : '0.00'
        }
      });
    } catch (error) {
      logger.error('Erro ao buscar estatísticas dos leads', {
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}
