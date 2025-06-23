import { UserPayload } from "@middlewares/auth.jwt.middlewares";
import { ActiveUserControllerDependencies, InputActiveUser } from "../interfaces";
import { ActiveUserInteractor } from "../usecases";
import { Request, Response } from 'express';

export class ActiveUserController {
  protected interactor: ActiveUserInteractor;

  constructor(params: ActiveUserControllerDependencies){
    this.interactor = params.interactor
  }

  public async activeUser(request: UserPayload, response: Response): Promise<Response> {
    const input: InputActiveUser = {
      password: request.body.password,
      idUser: request.user.id,
      
    };
    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}