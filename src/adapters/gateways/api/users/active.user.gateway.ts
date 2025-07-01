import {
  EncryptionService,
  LoggerMixin,
  TokenService
} from '../../../services';

class BaseGateway {
  constructor(..._args: unknown[]) {}
}
export const MixActiveUser = TokenService(
  EncryptionService(LoggerMixin(BaseGateway))
);
