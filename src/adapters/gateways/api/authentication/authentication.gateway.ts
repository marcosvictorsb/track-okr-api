import {
  TokenService,
  LoggerMixin,
  EncryptionService
} from '../../../services';

class BaseGateway {
  constructor(...args: any[]) {}
}
export const GetTokenMixed = TokenService(
  LoggerMixin(EncryptionService(BaseGateway))
);
