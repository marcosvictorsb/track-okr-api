import { LoggerMixin } from '../../../services';

class BaseGateway {
  constructor(...args: unknown[]) {}
}
export const MixCreatePlanner = LoggerMixin(BaseGateway);
