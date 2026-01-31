import { UserEntity } from '@domains/api/users/entity/user.entity';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { SettingEntity } from '../entity/setting.entity';
import {
  FindUserCriteria,
  IUpdateSettingGateway,
  UpdateSettingCriteria
} from '../interfaces/update.setting.interface';
import { SettingRepository } from '../repository/setting.repository';

export class UpdateSettingGateway implements IUpdateSettingGateway {
  protected userRepository: UserRepository;
  protected settingRepository: SettingRepository;

  constructor(
    userRepository: UserRepository,
    settingRepository: SettingRepository
  ) {
    this.userRepository = userRepository;
    this.settingRepository = settingRepository;
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    return await this.userRepository.find(criteria);
  }

  async findSetting(criteria: {
    id: number;
  }): Promise<SettingEntity | undefined> {
    return await this.settingRepository.find(criteria);
  }

  async updateSetting(criteria: UpdateSettingCriteria): Promise<SettingEntity> {
    const { id, ...updateData } = criteria;

    const updated = await this.settingRepository.update(updateData, { id });
    if (!updated) {
      throw new Error('Falha ao atualizar a configuração');
    }

    const updatedSetting = await this.settingRepository.find({ id });
    if (!updatedSetting) {
      throw new Error('Configuração não encontrada após atualização');
    }

    return updatedSetting;
  }

  loggerInfo(message: string, data?: unknown): void {
    console.log(`[UpdateSettingGateway] ${message}`, data);
  }

  loggerError(message: string, data?: unknown): void {
    console.error(`[UpdateSettingGateway] ${message}`, data);
  }
}
