import { UserRepository } from '@domains/api/users/repository/user.repository';
import { SettingRepository } from '../repository/setting.repository';
import {
  ICreateSettingGateway,
  FindUserCriteria,
  CreateSettingCriteria,
  UpdateSettingCriteria
} from '../interfaces/create.setting.interface';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { SettingEntity } from '../entity/setting.entity';

export class CreateSettingGateway implements ICreateSettingGateway {
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

  async findSettingByCompany(criteria: {
    id_company: number;
  }): Promise<SettingEntity | undefined> {
    return await this.settingRepository.find({
      id_company: criteria.id_company
    });
  }

  async createSetting(data: CreateSettingCriteria): Promise<SettingEntity> {
    return await this.settingRepository.create(data);
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
    console.log(`[CreateSettingGateway] ${message}`, data);
  }

  loggerError(message: string, data?: unknown): void {
    console.error(`[CreateSettingGateway] ${message}`, data);
  }
}
