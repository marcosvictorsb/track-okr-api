import { MixGetObjectives } from '@adapters/gateways/api/objectives';
import { logger } from '@configs/logger';
import { CheckinsEntity } from '@domains/api/checkins/entity/checkins.entity';
import { ICheckinsRepository } from '@domains/api/checkins/interfaces';
import { FindResultKeyCriteria } from '@domains/api/results-keys/interfaces/update.result.key.interface';
import {
  IGetKeyResultPeriodDetailGateway,
  IGetKeyResultPeriodDetailGatewayDependencies
} from '../interfaces/get.key.evolution.interface';

export class GetKeyResultPeriodDetailGateway
  extends MixGetObjectives
  implements IGetKeyResultPeriodDetailGateway
{
  checkinRepository: ICheckinsRepository;
  logging: typeof logger;

  constructor(params: IGetKeyResultPeriodDetailGatewayDependencies) {
    super(params);
    this.checkinRepository = params.checkinRepository;
    this.logging = params.logging;
  }

  async getCheckinsByPeriod(
    criteria: FindResultKeyCriteria
  ): Promise<CheckinsEntity[] | undefined> {
    this.logging.info('Buscando o resultado chave', {
      data: JSON.stringify(criteria)
    });
    return await this.checkinRepository.findMany(criteria);
  }
}
