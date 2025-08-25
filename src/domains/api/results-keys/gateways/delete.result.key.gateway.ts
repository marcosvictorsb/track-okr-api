import {
  DeleteResultKeyCriteria,
  IResultKeyRepository,
  IDeleteResultKeyGateway,
  IDeleteResultKeyGatewayDependencies,
  FindResultKeyCriteria
} from '@domains/api/results-keys/interfaces';
import { logger } from '@configs/logger';
import { MixDeleteResultKey } from '@adapters/gateways/api/result-key/delete.result.key.gateway';
import { ResultKeyEntity } from '../entity/result-key.entity';

export class DeleteResultKeyGateway
  extends MixDeleteResultKey
  implements IDeleteResultKeyGateway
{
  resultKeyRepository: IResultKeyRepository;
  logging: typeof logger;

  constructor(params: IDeleteResultKeyGatewayDependencies) {
    super(params);
    this.resultKeyRepository = params.resultKeyRepository;
    this.logging = params.logging;
  }

  public async deleteResultKey(
    data: DeleteResultKeyCriteria
  ): Promise<boolean> {
    this.logging.info('deletando resultado chave', { data });
    return await this.resultKeyRepository.delete(data);
  }

  public async findResultKey(
    criteria: FindResultKeyCriteria
  ): Promise<ResultKeyEntity | undefined> {
    this.logging.info('buscando resultado chave', { criteria });
    return await this.resultKeyRepository.findOne(criteria);
  }
}
