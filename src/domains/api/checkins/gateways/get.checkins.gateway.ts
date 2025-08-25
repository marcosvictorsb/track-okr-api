import { MixGetCheckinsHistory } from '@adapters/gateways/api/result-key';
import { CheckinsEntity } from '../entity/checkins.entity';
import { ResultKeyEntity } from '../../results-keys/entity/result-key.entity';
import {
  FindResultKeyCriteria,
  IResultKeyRepository
} from '../../results-keys/interfaces/default.interface';
import {
  FindCheckinsCriteria,
  ICheckinsRepository
} from '../interfaces/default.interface';
import { logger } from '@configs/logger';
import {
  IGetCheckinsGateway,
  IGetCheckinsGatewayDependencies
} from '../interfaces';

export class GetCheckinsGateway
  extends MixGetCheckinsHistory
  implements IGetCheckinsGateway
{
  resultKeyRepository: IResultKeyRepository;
  checkinsRepository: ICheckinsRepository;
  logging: typeof logger;

  constructor(params: IGetCheckinsGatewayDependencies) {
    super(params);
    this.resultKeyRepository = params.resultKeyRepository;
    this.checkinsRepository = params.checkinsRepository;
    this.logging = params.logging;
  }

  public async findResultKey(
    criteria: FindResultKeyCriteria
  ): Promise<ResultKeyEntity | undefined> {
    this.logging.info('Buscando resultado-chave por ID e empresa', {
      criteria: JSON.stringify(criteria)
    });

    return await this.resultKeyRepository.findOne(criteria);
  }

  public async findUpdatesByResultKey(
    criteria: FindCheckinsCriteria
  ): Promise<CheckinsEntity[]> {
    this.logging.info('Buscando atualizações do resultado-chave', {
      criteria: JSON.stringify(criteria)
    });

    return await this.checkinsRepository.findMany(criteria);
  }
}
