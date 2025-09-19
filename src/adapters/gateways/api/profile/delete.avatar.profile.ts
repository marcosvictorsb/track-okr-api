import { LoggerMixin } from '../../../services';

class BaseGateway {
  constructor(..._args: unknown[]) {}
}
export const MixDeleteAvatarProfile = LoggerMixin(BaseGateway);
