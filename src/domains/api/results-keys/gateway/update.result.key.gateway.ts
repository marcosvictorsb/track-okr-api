import { logger } from '@configs/logger';
import { ResultKeyEntity } from '../entity/result-key.entity';
import { IResultKeyRepository } from '../interfaces';
import {
  UpdateResultKeyGatewayDependencies,
  FindResultKeyCriteria,
  UpdateResultKeyCriteria,
  IUpdateResultKeyGateway
} from '../interfaces/update.result.key.interface';
import { LoggerMixin } from '@adapters/services';

class BaseGateway {
  constructor(..._args: unknown[]) {}
}

const MixUpdateResultKey = LoggerMixin(BaseGateway);

export class UpdateResultKeyGateway
  extends MixUpdateResultKey
  implements IUpdateResultKeyGateway
{
  resultKeyRepository: IResultKeyRepository;
  logging: typeof logger;

  constructor(params: UpdateResultKeyGatewayDependencies) {
    super(params);
    this.resultKeyRepository = params.resultKeyRepository;
    this.logging = params.logging;
  }

  async findResultKey(
    criteria: FindResultKeyCriteria
  ): Promise<ResultKeyEntity | undefined> {
    this.logging.info('Finding result key with criteria', { criteria });
    return await this.resultKeyRepository.findOne(criteria);
  }

  async updateResultKey(
    data: Partial<UpdateResultKeyCriteria>,
    criteria: FindResultKeyCriteria
  ): Promise<boolean> {
    this.logging.info('Updating result key', { data, criteria });
    const updateData: Record<string, unknown> = {};

    // Mapear campos que podem ser atualizados
    if (data.name !== undefined) updateData.name = data.name;
    if (data.initial_value !== undefined)
      updateData.initial_value = data.initial_value;
    if (data.target_value !== undefined)
      updateData.target_value = data.target_value;
    if (data.current_value !== undefined)
      updateData.current_value = data.current_value;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.responsible_users?.length) {
      updateData.responsible_users = data.responsible_users;
    }
    if (data.responsible_team_id !== undefined) {
      updateData.responsible_team_id = data.responsible_team_id;
    }

    this.logging.info('Mapped update data', { updateData });

    return await this.resultKeyRepository.update(updateData, criteria);
  }
}
