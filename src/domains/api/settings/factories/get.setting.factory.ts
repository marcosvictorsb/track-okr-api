import { logger } from '@configs/logger';
import { GetSettingGateway } from '../gateways/';
import SettingModel from '../model/setting.model';
import { SettingRepository } from '../repository/setting.repository';
import { GetSettingInteractor } from '../usecases';
import { Presenter } from '@protocols/presenter';
import { GetSettingController } from '../controllers';
import UserModel from '@domains/api/users/model/user.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';

const settingRepository = new SettingRepository({
  model: SettingModel
});

const userRepository = new UserRepository({
  model: UserModel
});

const params = {
  logging: logger,
  settingRepository,
  userRepository
};

const getSettingGateway = new GetSettingGateway(params);
const interactor = new GetSettingInteractor({
  gateway: getSettingGateway,
  presenter: new Presenter()
});

export const getSettingController = new GetSettingController({ interactor });
