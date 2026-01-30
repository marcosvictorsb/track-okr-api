/* eslint-disable @typescript-eslint/no-unused-vars */
import { LoggerMixin } from '../../../services';

class BaseGateway {
  constructor(...args: never[]) {}
}
export const MixGetOverviewGateway = LoggerMixin(BaseGateway);
