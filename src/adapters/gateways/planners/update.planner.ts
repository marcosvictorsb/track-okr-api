import { LoggerMixin } from '../../services';

class BaseGateway {
  constructor(..._args: unknown[]) {}
}
export const MixUpdatePlanner = LoggerMixin(BaseGateway);
