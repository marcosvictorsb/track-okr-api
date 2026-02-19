import { MixCreateExportRequest } from '@adapters/gateways/api/exports';
import { logger } from '@configs/logger';
import { IUserRepository } from '@domains/api/users/interfaces';
import { ExportRequestEntity } from '../entity/export.request.entity';
import {
  CreateExportRequestCriteria,
  CreateExportRequestCriteriaGateway,
  ICreateExportRequestGateway,
  ICreateExportRequestGatewayDependencies,
  IExportRequestRepository
} from '../interfaces';

export class CreateExportRequestGateway
  extends MixCreateExportRequest
  implements ICreateExportRequestGateway
{
  exportRequestRepository: IExportRequestRepository;
  userRepository: IUserRepository;
  logging: typeof logger;

  constructor(params: ICreateExportRequestGatewayDependencies) {
    super(params);
    this.exportRequestRepository = params.exportRequestRepository;
    this.userRepository = params.userRepository;
    this.logging = params.logging;
  }

  async createExportRequest(
    criteria: CreateExportRequestCriteriaGateway
  ): Promise<ExportRequestEntity> {
    this.logging.info('Criando solicitação de exportação', {
      criteria: JSON.stringify(criteria)
    });
    const user = await this.userRepository.find({
      id: criteria.id_user,
      id_company: criteria.id_company
    });

    if (!user) {
      this.logging.error(
        'Usuário não encontrado para criar solicitação de exportação',
        {
          criteria: JSON.stringify(criteria)
        }
      );
      throw new Error('Usuário não encontrado');
    }

    const criteriaToExportRequest: CreateExportRequestCriteria = {
      ...criteria,
      email: user.email
    };

    this.logging.info(
      'Criando solicitação de exportação com dados do usuário',
      {
        criteria: JSON.stringify(criteriaToExportRequest)
      }
    );

    return await this.exportRequestRepository.create(criteriaToExportRequest);
  }
}
