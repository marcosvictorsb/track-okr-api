import { LoggerMixin } from '../../../services';

class BaseGateway {
  constructor(..._args: unknown[]) {}
}
export const MixCreateSetting = LoggerMixin(BaseGateway);
