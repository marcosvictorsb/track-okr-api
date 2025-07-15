import { Request, Response } from 'express';
import { LandingPageLeadRepository } from '../repository/landing-page-lead.repository';
import { UpdateLandingPageLeadData } from '../interfaces/landing-page-lead.repository.interface';
import { logger } from '@configs/logger';

export interface UpdateLeadRequest extends Request {
  params: {
    id: string;
  };
  body: {
    status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
    notes?: string;
  };
}

export class UpdateLandingPageLeadController {
  private leadRepository: LandingPageLeadRepository;

  constructor() {
    this.leadRepository = new LandingPageLeadRepository();
  }

  async updateLeadStatus(
    req: UpdateLeadRequest,
    res: Response
  ): Promise<Response> {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      // Validação do ID
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID do lead é obrigatório e deve ser um número válido'
        });
      }

      // Validação do status
      if (status) {
        const validStatuses = [
          'new',
          'contacted',
          'qualified',
          'converted',
          'lost'
        ];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            message:
              'Status inválido. Use: new, contacted, qualified, converted ou lost'
          });
        }
      }

      // Verificar se o lead existe
      const existingLead = await this.leadRepository.findById(parseInt(id));
      if (!existingLead) {
        return res.status(404).json({
          success: false,
          message: 'Lead não encontrado'
        });
      }

      // Preparar dados para atualização
      const updateData: UpdateLandingPageLeadData = {};

      if (status) {
        updateData.status = status;

        // Definir timestamps específicos baseado no status
        if (status === 'contacted' && existingLead.status === 'new') {
          updateData.contacted_at = new Date();
        } else if (status === 'converted') {
          updateData.converted_at = new Date();
          if (!existingLead.contacted_at) {
            updateData.contacted_at = new Date();
          }
        }
      }

      if (notes !== undefined) {
        updateData.notes = notes;
      }

      // Atualizar o lead
      const updatedLead = await this.leadRepository.update(
        parseInt(id),
        updateData
      );

      if (!updatedLead) {
        return res.status(500).json({
          success: false,
          message: 'Erro ao atualizar lead'
        });
      }

      logger.info('Lead atualizado com sucesso', {
        id: updatedLead.id,
        email: updatedLead.email,
        oldStatus: existingLead.status,
        newStatus: updatedLead.status
      });

      return res.status(200).json({
        success: true,
        message: 'Lead atualizado com sucesso',
        data: updatedLead
      });
    } catch (error) {
      logger.error('Erro ao atualizar lead', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        leadId: req.params.id,
        body: req.body
      });

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async markAsContacted(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID do lead é obrigatório e deve ser um número válido'
        });
      }

      const updateData = {
        status: 'contacted' as const,
        contacted_at: new Date()
      };

      const updatedLead = await this.leadRepository.update(
        parseInt(id),
        updateData
      );

      if (!updatedLead) {
        return res.status(404).json({
          success: false,
          message: 'Lead não encontrado'
        });
      }

      logger.info('Lead marcado como contatado', {
        id: updatedLead.id,
        email: updatedLead.email
      });

      return res.status(200).json({
        success: true,
        message: 'Lead marcado como contatado',
        data: updatedLead
      });
    } catch (error) {
      logger.error('Erro ao marcar lead como contatado', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        leadId: req.params.id
      });

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  async markAsConverted(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'ID do lead é obrigatório e deve ser um número válido'
        });
      }

      const existingLead = await this.leadRepository.findById(parseInt(id));
      if (!existingLead) {
        return res.status(404).json({
          success: false,
          message: 'Lead não encontrado'
        });
      }

      const updateData: UpdateLandingPageLeadData = {
        status: 'converted' as const,
        converted_at: new Date()
      };

      // Se ainda não foi marcado como contatado, marcar também
      if (!existingLead.contacted_at) {
        updateData.contacted_at = new Date();
      }

      const updatedLead = await this.leadRepository.update(
        parseInt(id),
        updateData
      );

      logger.info('Lead marcado como convertido', {
        id: updatedLead!.id,
        email: updatedLead!.email
      });

      return res.status(200).json({
        success: true,
        message: 'Lead marcado como convertido',
        data: updatedLead
      });
    } catch (error) {
      logger.error('Erro ao marcar lead como convertido', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        leadId: req.params.id
      });

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}
