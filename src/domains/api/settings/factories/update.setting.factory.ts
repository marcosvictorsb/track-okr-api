import UserModel from '@domains/api/users/model/user.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { Presenter } from '@protocols/presenter';
import { UpdateSettingController } from '../controllers/update.setting.controller';
import { UpdateSettingGateway } from '../gateways/update.setting.gateway';
import SettingModel from '../model/setting.model';
import { SettingRepository } from '../repository/setting.repository';
import { UpdateSettingInteractor } from '../usecases/update.setting.interactor';

const settingRepository = new SettingRepository({
  model: SettingModel
});

const userRepository = new UserRepository({
  model: UserModel
});

const updateSettingGateway = new UpdateSettingGateway(
  userRepository,
  settingRepository
);

const interactor = new UpdateSettingInteractor({
  gateway: updateSettingGateway,
  presenter: new Presenter()
});

export const updateSettingController = new UpdateSettingController({
  interactor
});
