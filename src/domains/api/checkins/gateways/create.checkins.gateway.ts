import {
  ICreateCheckinsGateway,
  ICreateCheckinsGatewayDependencies
} from '../interfaces/create.checkins.interface';
import { CheckinsEntity } from '../entity/checkins.entity';
import { ResultKeyEntity } from '../../results-keys/entity/result-key.entity';
import {
  FindResultKeyCriteria,
  IResultKeyRepository
} from '../../results-keys/interfaces/default.interface';
import { ICheckinsRepository } from '../interfaces/default.interface';
import { MixCreateObjectives } from '@adapters/gateways/api/objectives';
import { logger } from '@configs/logger';

export class CreateCheckinsGateway
  extends MixCreateObjectives
  implements ICreateCheckinsGateway
{
  resultKeyRepository: IResultKeyRepository;
  checkinsRepository: ICheckinsRepository;
  logging: typeof logger;

  constructor(params: ICreateCheckinsGatewayDependencies) {
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

  public async createUpdate(data: {
    id_result_key: number;
    previous_value?: number | null;
    new_value: number;
    comment?: string | null;
    id_user: number;
  }): Promise<CheckinsEntity> {
    this.logging.info('Criando atualização de resultado-chave', {
      id_result_key: data.id_result_key,
      id_user: data.id_user
    });

    return await this.checkinsRepository.create(data);
  }

  public async updateResultKeyCurrentValue(
    id: number,
    new_value: number
  ): Promise<boolean> {
    this.logging.info('Atualizando valor atual do resultado-chave', {
      data: JSON.stringify({ id, new_value })
    });

    const updated = await this.resultKeyRepository.update(
      { current_value: new_value },
      { id }
    );

    return updated !== null;
  }
}
