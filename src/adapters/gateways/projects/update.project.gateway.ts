import { LoggerMixin } from "../../services";

class BaseGateway { constructor(...args: any[]) {} }
export const MixUpdateProjectService = LoggerMixin(BaseGateway);
