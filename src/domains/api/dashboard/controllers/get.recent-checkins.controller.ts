import { Request, Response } from 'express';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { GetRecentCheckInsInteractor } from '../usecases/get.recent-checkins.interactor';

export interface GetRecentCheckInsControllerDependencies {
  interactor: GetRecentCheckInsInteractor;
}

export class GetRecentCheckInsController {
  protected interactor: GetRecentCheckInsInteractor;

  constructor(params: GetRecentCheckInsControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async getRecentCheckIns(
    req: Request & UserPayload,
    res: Response
  ): Promise<Response> {
    const { id_company, id } = req.user;
    const { quarter, year } = req.query;

    const response = await this.interactor.execute({
      id_user: id,
      id_company,
      quarter: quarter ? Number(quarter) : undefined,
      year: year ? Number(year) : undefined
    });

    return res.status(response.status).json(response.body);
  }
}
