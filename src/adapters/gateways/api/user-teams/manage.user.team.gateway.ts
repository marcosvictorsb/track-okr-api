import { LoggerMixin } from '../../../services';

class BaseGateway {
  constructor(..._args: unknown[]) {}
}
export const MixManageUserTeam = LoggerMixin(BaseGateway);
