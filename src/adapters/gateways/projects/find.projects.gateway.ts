import { LoggerMixin } from '../../services';

class BaseGateway {
  constructor(...args: any[]) {}
}
export const MixFindProjectsService = LoggerMixin(BaseGateway);
