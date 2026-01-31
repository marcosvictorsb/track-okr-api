import UserModel from '@domains/api/users/model/user.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { Presenter } from '@protocols/presenter';
import { CreateSettingController } from '../controllers/create.setting.controller';
import { CreateSettingGateway } from '../gateways/create.setting.gateway';
import SettingModel from '../model/setting.model';
import { SettingRepository } from '../repository/setting.repository';
import { CreateSettingInteractor } from '../usecases/create.setting.interactor';

const userRepository = new UserRepository({ model: UserModel });
const settingRepository = new SettingRepository({ model: SettingModel });
const gateway = new CreateSettingGateway(userRepository, settingRepository);
const presenter = new Presenter();
const interactor = new CreateSettingInteractor({ gateway, presenter });
const createSettingController = new CreateSettingController({ interactor });

export { createSettingController };
