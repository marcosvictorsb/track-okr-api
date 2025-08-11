import { LoggerMixin } from '../../../services';

class BaseGateway {
  constructor(...args: any[]) {}
}
export const MixCreatePlan = LoggerMixin(BaseGateway);
