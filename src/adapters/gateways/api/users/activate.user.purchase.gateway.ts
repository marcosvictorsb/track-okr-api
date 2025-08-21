import {
  EncryptionService,
  LoggerMixin,
  TokenService
} from '../../../services';

class BaseGateway {
  constructor(..._args: unknown[]) {}
}
export const MixActivateUserPurchase = TokenService(
  EncryptionService(LoggerMixin(BaseGateway))
);
