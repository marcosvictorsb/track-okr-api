import { logger } from '@configs/logger';

export type DataLogOutput = {
  data?: any;
  teamsIds?: number[];
  error?: any;
  input?: any;
  requestTxt?: string;

  id_user?: number;
  id_expense?: number;
  id_income?: number;
  email?: string;

  // company
  id_company?: number;
  amount_users?: number;
};

type LoggerServiceDependencies = {
  logging: typeof logger;
};

export interface ILoggerMixin {
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerErro(message: string, data?: DataLogOutput): void;
}

export function LoggerMixin<T extends new (...args: any[]) => {}>(Base: T) {
  return class extends Base {
    public logging: typeof logger;

    constructor(...args: any[]) {
      super(...args);
      const params = args[0] as LoggerServiceDependencies;
      this.logging = params.logging;
    }

    loggerInfo(message: string, data?: DataLogOutput) {
      return this.logging.info(message, data);
    }

    loggerError(message: string, data?: DataLogOutput) {
      return this.logging.error(message, data);
    }
  };
}
