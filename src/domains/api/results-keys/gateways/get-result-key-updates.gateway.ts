import { MixGetKeyResultUpdatesHistory } from '@adapters/gateways/api/result-key';
import { ResultKeyUpdateEntity } from '../entity/result-key-update.entity';
import { ResultKeyEntity } from '../entity/result-key.entity';
import {
  FindResultKeyCriteria,
  IResultKeyRepository
} from '../interfaces/default.interface';
import {
  FindResultKeyUpdateCriteria,
  IResultKeyUpdateRepository
} from '../interfaces/result-key-update.interface';
import { logger } from '@configs/logger';
import {
  IGetKeyResultUpdateGateway,
  IGetKeyResultUpdateGatewayDependencies
} from '../interfaces';

export class GetResultKeyUpdatesGateway
  extends MixGetKeyResultUpdatesHistory
  implements IGetKeyResultUpdateGateway
{
  resultKeyRepository: IResultKeyRepository;
  resultKeyUpdateRepository: IResultKeyUpdateRepository;
  logging: typeof logger;

  constructor(params: IGetKeyResultUpdateGatewayDependencies) {
    super(params);
    this.resultKeyRepository = params.resultKeyRepository;
    this.resultKeyUpdateRepository = params.resultKeyUpdateRepository;
    this.logging = params.logging;
  }

  public async findResultKey(
    criteria: FindResultKeyCriteria
  ): Promise<ResultKeyEntity | null> {
    this.logging.info('Buscando resultado-chave por ID e empresa', {
      criteria: JSON.stringify(criteria)
    });

    return await this.resultKeyRepository.findOne(criteria);
  }

  public async findUpdatesByResultKey(
    criteria: FindResultKeyUpdateCriteria
  ): Promise<ResultKeyUpdateEntity[]> {
    this.logging.info('Buscando atualizações do resultado-chave', {
      criteria: JSON.stringify(criteria)
    });

    return await this.resultKeyUpdateRepository.findMany(criteria);
  }
}
