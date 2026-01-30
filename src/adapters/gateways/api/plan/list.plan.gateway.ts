import { LoggerMixin } from '../../../services';

class BaseGateway {
  constructor(...args: unknown[]) {}
}
export const MixListPlan = LoggerMixin(BaseGateway);
