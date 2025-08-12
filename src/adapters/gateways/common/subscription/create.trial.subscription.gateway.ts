/* eslint-disable @typescript-eslint/no-unused-vars */
import { LoggerMixin } from '../../../services/logger.service';

class BaseGateway {
  constructor(...args: any[]) {}
}
export const MixCreateTrialSubscription = LoggerMixin(BaseGateway);
