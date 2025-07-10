import {
  ICreateResultKeyUpdateGateway,
  ICreateResultKeyUpdateGatewayDependencies
} from '../interfaces/create-result-key-update.interface';
import { ResultKeyUpdateEntity } from '../entity/result-key-update.entity';
import { ResultKeyEntity } from '../entity/result-key.entity';
import {
  FindResultKeyCriteria,
  IResultKeyRepository
} from '../interfaces/default.interface';
import { IResultKeyUpdateRepository } from '../interfaces/result-key-update.interface';
import { MixCreateObjectives } from '@adapters/gateways/api/objectives';
import { logger } from '@configs/logger';

export class CreateResultKeyUpdateGateway
  extends MixCreateObjectives
  implements ICreateResultKeyUpdateGateway
{
  resultKeyRepository: IResultKeyRepository;
  resultKeyUpdateRepository: IResultKeyUpdateRepository;
  logging: typeof logger;

  constructor(params: ICreateResultKeyUpdateGatewayDependencies) {
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

  public async createUpdate(data: {
    id_result_key: number;
    previous_value?: number | null;
    new_value: number;
    comment?: string | null;
    id_user: number;
  }): Promise<ResultKeyUpdateEntity> {
    this.logging.info('Criando atualização de resultado-chave', {
      id_result_key: data.id_result_key,
      id_user: data.id_user
    });

    return await this.resultKeyUpdateRepository.create(data);
  }

  public async updateResultKeyCurrentValue(
    id: number,
    new_value: number
  ): Promise<boolean> {
    this.logging.info('Atualizando valor atual do resultado-chave', {
      id,
      new_value
    });

    const updated = await this.resultKeyRepository.update(
      { id },
      { current_value: new_value, updated_at: new Date() }
    );

    return updated !== null;
  }
}
