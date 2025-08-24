import { Request, Response } from 'express';
import {
  InputUpdateSetting,
  UpdateSettingControllerDependencies
} from '../interfaces/update.setting.interface';
import { UserPayload } from '@middlewares/index';

export class UpdateSettingController {
  private interactor: UpdateSettingControllerDependencies['interactor'];

  constructor(params: UpdateSettingControllerDependencies) {
    this.interactor = params.interactor;
  }

  async handle(request: UserPayload, response: Response): Promise<void> {
    const { id } = request.params;
    const {
      block_okr_creation,
      block_key_result_creation,
      block_okr_editing,
      block_key_result_editing,
      allowed_quarters,
      current_quarter_only
    } = request.body;

    const input: InputUpdateSetting = {
      id: Number(id),
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
