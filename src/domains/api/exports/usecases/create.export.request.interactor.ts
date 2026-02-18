import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  CreateExportRequestInteractorDependencies,
  ICreateExportRequestGateway,
  InputCreateExportRequest
} from '../interfaces/create.export.request.interface';
import { ExportRequestStatus } from '../interfaces/default.interfaces';

export class CreateExportRequestInteractor {
  protected gateway: ICreateExportRequestGateway;
  protected presenter: IPresenter;

  constructor(params: CreateExportRequestInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  async execute(input: InputCreateExportRequest): Promise<HttpResponse> {
    try {
      const { id_user, id_company } = input;

      this.gateway.loggerInfo(
        'Iniciando criação de solicitação de exportação',
        {
          data: JSON.stringify({ id_user, id_company })
        }
      );

      const exportRequest = await this.gateway.createExportRequest({
        id_user,
        id_company,
        status: ExportRequestStatus.PENDING,
        requested_at: new Date()
      });

      this.gateway.loggerInfo('Solicitação de exportação criada com sucesso', {
        data: JSON.stringify({
          id: exportRequest.id,
          id_user,
          id_company
        })
      });

      return this.presenter.created({
        id: exportRequest.id,
        message: 'Solicitação de exportação criada com sucesso',
        status: exportRequest.status
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';

      this.gateway.loggerError('Erro ao criar solicitação de exportação', {
        data: JSON.stringify({ error: errorMessage })
      });

      return this.presenter.serverError(
        'Erro ao criar solicitação de exportação'
      );
    }
  }
}
