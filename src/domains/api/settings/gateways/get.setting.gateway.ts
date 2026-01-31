import { MixGetSetting } from '@adapters/gateways/api/settings';
import { logger } from '@configs/logger';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  FindUserCriteria,
  IUserRepository
} from '@domains/api/users/interfaces';
import { SettingEntity } from '../entity/setting.entity';
import {
  FindSettingCriteria,
  IGetSettingGateway,
  IGetSettingGatewayDependencies,
  ISettingRepository
} from '../interfaces';

export class GetSettingGateway
  extends MixGetSetting
  implements IGetSettingGateway
{
  settingRepository: ISettingRepository;
  userRepository: IUserRepository;
  logging: typeof logger;

  constructor(params: IGetSettingGatewayDependencies) {
    super(params);
    this.settingRepository = params.settingRepository;
    this.userRepository = params.userRepository;
    this.logging = params.logging;
  }

  async findSetting(
    criteria: FindSettingCriteria
  ): Promise<SettingEntity | undefined> {
    this.logging.info('Iniciando busca das configurações', { criteria });
    return await this.settingRepository.find(criteria);
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    this.logging.info('Iniciando busca do usuário', { criteria });
    return await this.userRepository.find(criteria);
  }
}
