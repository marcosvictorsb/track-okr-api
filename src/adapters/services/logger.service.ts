/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from '@configs/logger';
import { asyncLocalStorage } from '@configs/async.context';

export type DataLogOutput = {
  data?: string;
  teamsIds?: number[];
  error?: string;
  input?: string;
  requestTxt?: string;
  count?: number;

  id_user?: number;
  id_expense?: number;
  id_income?: number;
  email?: string;
  role?: string;

  // company
  id_company?: number;
  company_name?: string;
  amount_users?: number;

  // planner
  title?: string;
  description?: string;
  year?: number;

  // teams
  id_team?: number;

  // user-teams
  id_user_to_add?: number;
  role_in_team?: string;
  userTeamId?: number;
  id_user_to_manage?: number;
  action?: string;

  // resultado chave
  id_result_key?: number;

  // password reset
  token?: string;

  // plan
  plan?: string;
  plan_id?: number;
  plan_name?: string;
  trial_days?: number;

  // subscription
  subscription_id?: number;
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
      const store = asyncLocalStorage.getStore();
      const requestId = store?.requestId || 'no-request-id';
      return this.logging.info(message, { ...data, requestId });
    }

    loggerError(message: string, data?: DataLogOutput) {
      const store = asyncLocalStorage.getStore();
      const requestId = store?.requestId || 'no-request-id';
      return this.logging.error(message, { ...data, requestId });
    }
  };
}
