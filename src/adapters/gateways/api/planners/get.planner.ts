import { LoggerMixin } from '../../../services';

class BaseGateway {
  constructor(...args: unknown[]) {}
}
export const MixGetPlanner = LoggerMixin(BaseGateway);
