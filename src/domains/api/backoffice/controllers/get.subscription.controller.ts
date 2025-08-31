import { Request, Response } from 'express';
import { GetSubscriptionInteractor } from '../usecases/get.subscription.interactor';
import { InputGetSubscription } from '../interfaces/get.subscription.interfaces';

export class GetSubscriptionController {
  constructor(private interactor: GetSubscriptionInteractor) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      // Parâmetros de query para paginação
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Construir input baseado na interface
      const input: InputGetSubscription = {
        page,
        limit
      };

      // Parâmetros de filtro opcionais
      if (req.query.status) {
        input.status = req.query.status as InputGetSubscription['status'];
      }

      if (req.query.plan_id) {
        input.plan_id = parseInt(req.query.plan_id as string);
      }

      if (req.query.company_id) {
        input.company_id = parseInt(req.query.company_id as string);
      }

      if (req.query.created_by) {
        input.created_by = parseInt(req.query.created_by as string);
      }

      if (req.query.dateFrom) {
        input.dateFrom = req.query.dateFrom as string;
      }

      if (req.query.dateTo) {
        input.dateTo = req.query.dateTo as string;
      }

      if (req.query.includeHistory) {
        input.includeHistory = req.query.includeHistory === 'true';
      }

      if (req.query.historyLimit) {
        input.historyLimit = parseInt(req.query.historyLimit as string);
      }

      // Executar o interactor
      const result = await this.interactor.execute(input);

      res.status(200).json({
        success: true,
        ...result,
        message: 'Subscriptions retrieved successfully'
      });
    } catch (error) {
      console.error('[GetSubscriptionController] Error:', error);

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
          error:
            process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      } else {
        res.status(500).json({
          success: false,
          message:
            'Internal server error occurred while retrieving subscriptions'
        });
      }
    }
  }
}
