import UserModel from '@domains/api/users/model/user.model';
import SettingModel from '../model/setting.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { SettingRepository } from '../repository/setting.repository';
import { CreateSettingGateway } from '../gateways/create.setting.gateway';
import { CreateSettingInteractor } from '../usecases/create.setting.interactor';
import { CreateSettingController } from '../controllers/create.setting.controller';
import { Presenter } from '@protocols/presenter';

const userRepository = new UserRepository({ model: UserModel });
const settingRepository = new SettingRepository({ model: SettingModel });
const gateway = new CreateSettingGateway(userRepository, settingRepository);
const presenter = new Presenter();
const interactor = new CreateSettingInteractor({ gateway, presenter });
const createSettingController = new CreateSettingController({ interactor });

export { createSettingController };
