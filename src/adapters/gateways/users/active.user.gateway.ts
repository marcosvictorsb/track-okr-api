import { EncryptionService, LoggerMixin } from "../../services";

class BaseGateway { constructor(...args: any[]) {} }
export const MixActiveUser = EncryptionService(LoggerMixin(BaseGateway));
