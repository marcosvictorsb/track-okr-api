import { LoggerMixin } from '@adapters/services';
import { logger } from '@configs/logger';
import { SettingEntity } from '@domains/api/settings/entity/setting.entity';
import { ISettingRepository } from '@domains/api/settings/interfaces/default.interfaces';
import {
  CreateSettingCriteria,
  ICreateSettingGateway
} from './interfaces/create.setting.interface';

export class CreateSettingGateway
  extends LoggerMixin(class {})
  implements ICreateSettingGateway
{
  protected settingRepository: ISettingRepository;

  constructor(params: {
    settingRepository: ISettingRepository;
    logging: typeof logger;
  }) {
    super();
    this.logging = params.logging;
    this.settingRepository = params.settingRepository;
  }

  async findSetting(criteria: {
    id_company: number;
  }): Promise<SettingEntity | undefined> {
    return this.settingRepository.find({ id_company: criteria.id_company });
  }

  async createSetting(data: CreateSettingCriteria): Promise<SettingEntity> {
    return this.settingRepository.create(data);
  }
}
