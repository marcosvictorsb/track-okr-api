import { LoggerMixin } from '../../../services';

class BaseGateway {
  constructor(..._args: unknown[]) {}
}
export const MixDeleteTeam = LoggerMixin(BaseGateway);
