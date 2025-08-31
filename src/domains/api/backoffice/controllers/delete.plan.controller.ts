import { Request, Response } from 'express';
import { DeletePlanControllerDependencies } from '../interfaces/delete.plan.interfaces';
import { DeletePlanInteractor } from '../usecases/delete.plan.interactor';

export class DeletePlanController {
  protected interactor: DeletePlanInteractor;

  constructor(params: DeletePlanControllerDependencies) {
    this.interactor = params.interactor;
  }

  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID do plano é obrigatório e deve ser um número válido'
      });
    }

    const result = await this.interactor.execute({ id: Number(id) });

    return res.status(result.status).json(result.body);
  }
}
