/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  EncryptionService,
  LoggerMixin,
  TokenService
} from '../../../services';

class BaseGateway {
  constructor(...args: unknown[]) {}
}
export const GetTokenMixed = TokenService(
  LoggerMixin(EncryptionService(BaseGateway))
);
