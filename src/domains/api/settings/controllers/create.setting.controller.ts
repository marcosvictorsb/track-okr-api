import { UserPayload } from '@middlewares/index';
import { Response } from 'express';
import {
  CreateSettingControllerDependencies,
  InputCreateSetting
} from '../interfaces/create.setting.interface';

export class CreateSettingController {
  private interactor: CreateSettingControllerDependencies['interactor'];

  constructor(params: CreateSettingControllerDependencies) {
    this.interactor = params.interactor;
  }

  async handle(request: UserPayload, response: Response): Promise<void> {
    const {
      block_okr_creation,
      block_key_result_creation,
      block_okr_editing,
      block_key_result_editing,
      allowed_quarters,
      current_quarter_only
    } = request.body;

    const input: InputCreateSetting = {
      block_okr_creation,
      block_key_result_creation,
      block_okr_editing,
      block_key_result_editing,
      allowed_quarters,
      current_quarter_only,
      id_user: Number(request.user.id),
      id_company: Number(request.user.id_company)
    };

    const httpResponse = await this.interactor.execute(input);

    response.status(httpResponse.status).json(httpResponse.body);
  }
}
