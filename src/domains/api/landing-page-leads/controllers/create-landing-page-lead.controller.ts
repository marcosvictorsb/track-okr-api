import { logger } from '@configs/logger';
import { Request, Response } from 'express';
import { LandingPageLeadRepository } from '../repository/landing-page-lead.repository';

export interface CreateLeadRequest extends Request {
  body: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    site?: string;
    position?: string;
    companySize?: string;
    source?: string;
    page_url?: string;
    user_agent?: string;
    timestamp?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  };
}

export class CreateLandingPageLeadController {
  private leadRepository: LandingPageLeadRepository;

  constructor() {
    this.leadRepository = new LandingPageLeadRepository();
  }

  async createLead(req: CreateLeadRequest, res: Response): Promise<Response> {
    try {
      const {
        name,
        email,
        company,
        phone,
        position,
        companySize,
        source,
        page_url,
        user_agent,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
        site
      } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: 'Nome e email são obrigatórios'
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de email inválido'
        });
      }

      const ip_address = req.ip || req.connection.remoteAddress || undefined;

      // Verificar se já existe um lead com o mesmo email
      // const existingLead = await this.leadRepository.findByEmail(email);
      // if (existingLead) {
      //   logger.info('Lead já existe, atualizando informações', {
      //     email,
      //     existingId: existingLead.id
      //   });

      //   // Opcionalmente, atualizar informações se necessário
      //   return res.status(200).json({
      //     success: true,
      //     message: 'Lead já registrado anteriormente',
      //     data: {
      //       id: existingLead.id,
      //       email: existingLead.email,
      //       name: existingLead.name,
      //       company: existingLead.company,
      //       phone: existingLead.phone
      //     }
      //   });
      // }

      const leadData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: company?.trim(),
        phone: phone?.trim(),
        position: position?.trim(),
        site: site?.trim(),
        company_size: companySize,
        source: source || 'landing-page',
        page_url,
        user_agent,
        ip_address,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content
      };

      const newLead = await this.leadRepository.create(leadData);

      logger.info('Novo lead criado com sucesso', {
        id: newLead.id,
        email: newLead.email,
        company: newLead.company,
        source: newLead.source
      });

      return res.status(201).json({
        success: true,
        message: 'Lead registrado com sucesso',
        data: {
          id: newLead.id,
          email: newLead.email,
          name: newLead.name,
          company: newLead.company,
          phone: newLead.phone
        }
      });
    } catch (error) {
      logger.error('Erro ao criar lead', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        body: req.body
      });

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}
