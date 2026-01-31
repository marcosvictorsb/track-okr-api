import { MixGetProfile } from '@adapters/gateways/api/profile';
import { logger } from '@configs/logger';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { IUserRepository } from '@domains/api/users/interfaces';
import { ProfileEntity } from '../entity/profile.entity';
import { IProfileRepository } from '../interfaces/default.interfaces';
import {
  IGetProfileGateway,
  IGetProfileGatewayDependencies
} from '../interfaces/get.profile.interface';

export class GetProfileGateway
  extends MixGetProfile
  implements IGetProfileGateway
{
  private profileRepository: IProfileRepository;
  private userRepository: IUserRepository;
  public logging: typeof logger;

  constructor(params: IGetProfileGatewayDependencies) {
    super(params);
    this.profileRepository = params.profileRepository;
    this.userRepository = params.userRepository;
    this.logging = params.logging;
  }

  public async findUser(id: number): Promise<UserEntity | null> {
    this.logging.info('Buscando usuário para profile', { id_user: id });
    const user = await this.userRepository.find({ id });
    return user || null;
  }

  public async findUserProfile(userId: number): Promise<ProfileEntity | null> {
    this.logging.info('Buscando perfil do usuário', { id_user: userId });
    const profile = await this.profileRepository.findByUserId(userId);
    return profile || null;
  }
}
