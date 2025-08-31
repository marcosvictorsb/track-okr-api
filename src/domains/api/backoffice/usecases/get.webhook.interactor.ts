import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  GetWebhookInteractorDependencies,
  IGetWebhookGateway,
  InputGetWebhook
} from '../interfaces/get.webhook.interfaces';
import {
  FindWebhookCriteria,
  WebhookStatus
} from '@domains/common/webhooks/interfaces/default.interfaces';

export class GetWebhookInteractor {
  protected presenter: IPresenter;
  protected gateway: IGetWebhookGateway;

  constructor(params: GetWebhookInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  async execute(input: InputGetWebhook): Promise<HttpResponse> {
    this.gateway.loggerInfo('Case de uso listar webhooks iniciado', {
      data: JSON.stringify(input)
    });

    try {
      const { page = 1, limit = 20, source, status, dateFrom, dateTo } = input;

      // Validar parâmetros de paginação
      if (page < 1 || limit < 1 || limit > 100) {
        return this.presenter.badRequest(
          'Parâmetros de paginação inválidos. Page >= 1, Limit entre 1 e 100'
        );
      }

      // Construir critérios de busca
      const criteria: FindWebhookCriteria = {};

      if (source) {
        criteria.source = source;
      }

      if (status) {
        criteria.status = status as WebhookStatus;
      }

      if (dateFrom) {
        criteria.createdFrom = new Date(dateFrom);
      }

      if (dateTo) {
        criteria.createdTo = new Date(dateTo);
      }

      // Buscar webhooks
      const result = await this.gateway.findWebhooks(criteria, page, limit);

      this.gateway.loggerInfo('Webhooks listados com sucesso', {
        data: `Total: ${result.total}, Page: ${page}, Limit: ${limit}`
      });

      return this.presenter.ok({
        webhooks: result.webhooks,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      this.gateway.loggerError('Erro ao listar webhooks', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        data: JSON.stringify(input)
      });

      return this.presenter.serverError(
        'Erro interno do servidor ao listar webhooks'
      );
    }
  }
}
