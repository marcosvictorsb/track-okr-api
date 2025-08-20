import { SubscriptionHistoryEntity } from '../entity/subscription.history.entity';
import { SubscriptionHistoryAction } from '../model/subscription.history.model';
import { ModelStatic } from 'sequelize';
import SubscriptionHistoryModel from '../model/subscription.history.model';

// Enum para as ações do histórico
export enum SubscriptionHistoryActions {
  CREATED = 'created',
  ACTIVATED = 'activated',
  UPGRADED = 'upgraded',
  DOWNGRADED = 'downgraded',
  RENEWED = 'renewed',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  REACTIVATED = 'reactivated',
  TRIAL_STARTED = 'trial_started',
  TRIAL_EXTENDED = 'trial_extended',
  TRIAL_CONVERTED = 'trial_converted',
  PLAN_CHANGED = 'plan_changed',
  LIMITS_UPDATED = 'limits_updated'
}

// Type helper para uso em interfaces
export type SubscriptionHistoryActionType = `${SubscriptionHistoryActions}`;

// Array com todos os valores (útil para validações)
export const SUBSCRIPTION_HISTORY_ACTION_VALUES = Object.values(
  SubscriptionHistoryActions
) as SubscriptionHistoryActionType[];

// Função helper para verificar se um valor é uma ação válida
export function isValidSubscriptionHistoryAction(
  action: string
): action is SubscriptionHistoryActionType {
  return SUBSCRIPTION_HISTORY_ACTION_VALUES.includes(
    action as SubscriptionHistoryActionType
  );
}

// Mapeamento para descrições em português
export const SUBSCRIPTION_HISTORY_ACTION_DESCRIPTIONS: Record<
  SubscriptionHistoryActions,
  string
> = {
  [SubscriptionHistoryActions.CREATED]: 'Subscription criada',
  [SubscriptionHistoryActions.ACTIVATED]: 'Subscription ativada',
  [SubscriptionHistoryActions.UPGRADED]: 'Plano atualizado (upgrade)',
  [SubscriptionHistoryActions.DOWNGRADED]: 'Plano rebaixado (downgrade)',
  [SubscriptionHistoryActions.RENEWED]: 'Subscription renovada',
  [SubscriptionHistoryActions.CANCELED]: 'Subscription cancelada',
  [SubscriptionHistoryActions.EXPIRED]: 'Subscription expirada',
  [SubscriptionHistoryActions.SUSPENDED]: 'Subscription suspensa',
  [SubscriptionHistoryActions.REACTIVATED]: 'Subscription reativada',
  [SubscriptionHistoryActions.TRIAL_STARTED]: 'Período de teste iniciado',
  [SubscriptionHistoryActions.TRIAL_EXTENDED]: 'Período de teste estendido',
  [SubscriptionHistoryActions.TRIAL_CONVERTED]: 'Trial convertido em pago',
  [SubscriptionHistoryActions.PLAN_CHANGED]: 'Plano alterado',
  [SubscriptionHistoryActions.LIMITS_UPDATED]: 'Limites atualizados'
};

// Interface para criar um novo registro de histórico
export interface CreateSubscriptionHistoryCriteria {
  subscription_id: number;
  action: SubscriptionHistoryAction;
  previous_status?: string;
  new_status?: string;
  previous_plan_id?: number;
  new_plan_id?: number;
  reason?: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_by?: number;
  automated?: boolean;
  notes?: string;
}

// Interface para buscar registros de histórico
export interface FindSubscriptionHistoryCriteria {
  id?: number;
  subscription_id?: number;
  action?: SubscriptionHistoryAction | SubscriptionHistoryAction[];
  created_by?: number;
  automated?: boolean;
  date_from?: Date;
  date_to?: Date;
  limit?: number;
  offset?: number;
}

// Interface para filtros avançados de busca
export interface SubscriptionHistoryFilters {
  subscription_ids?: number[];
  actions?: SubscriptionHistoryAction[];
  user_ids?: number[];
  automated_only?: boolean;
  manual_only?: boolean;
  with_metadata?: boolean;
  plan_changes_only?: boolean;
  status_changes_only?: boolean;
  trial_actions_only?: boolean;
}

// Interface para ordenação
export interface SubscriptionHistorySort {
  field: 'created_at' | 'action' | 'subscription_id';
  direction: 'ASC' | 'DESC';
}

// Interface para paginação
export interface SubscriptionHistoryPagination {
  page: number;
  limit: number;
}

// Interface para resultado paginado
export interface PaginatedSubscriptionHistory {
  data: SubscriptionHistoryEntity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Interface para estatísticas do histórico
export interface SubscriptionHistoryStats {
  total_records: number;
  automated_actions: number;
  manual_actions: number;
  most_common_action: SubscriptionHistoryAction;
  actions_by_type: Record<SubscriptionHistoryAction, number>;
  timeline: {
    date: string;
    count: number;
  }[];
}

// Dependencies para o repository
export type SubscriptionHistoryRepositoryDependencies = {
  model: ModelStatic<SubscriptionHistoryModel>;
};

// Interface principal do repository
export interface ISubscriptionHistoryRepository {
  // Operações básicas
  create(
    data: CreateSubscriptionHistoryCriteria
  ): Promise<SubscriptionHistoryEntity>;
  find(
    criteria: FindSubscriptionHistoryCriteria
  ): Promise<SubscriptionHistoryEntity | undefined>;
  findAll(
    criteria?: FindSubscriptionHistoryCriteria
  ): Promise<SubscriptionHistoryEntity[]>;
  delete(id: number): Promise<boolean>;

  // Operações específicas do domínio
  findBySubscription(
    subscriptionId: number,
    options?: {
      limit?: number;
      offset?: number;
      sort?: SubscriptionHistorySort;
    }
  ): Promise<SubscriptionHistoryEntity[]>;

  findBySubscriptionPaginated(
    subscriptionId: number,
    pagination: SubscriptionHistoryPagination,
    filters?: SubscriptionHistoryFilters,
    sort?: SubscriptionHistorySort
  ): Promise<PaginatedSubscriptionHistory>;

  findByAction(
    action: SubscriptionHistoryAction,
    options?: {
      limit?: number;
      offset?: number;
      date_from?: Date;
      date_to?: Date;
    }
  ): Promise<SubscriptionHistoryEntity[]>;

  findByUser(
    userId: number,
    options?: {
      limit?: number;
      offset?: number;
      subscription_id?: number;
    }
  ): Promise<SubscriptionHistoryEntity[]>;

  findAutomatedActions(options?: {
    limit?: number;
    offset?: number;
    date_from?: Date;
    date_to?: Date;
  }): Promise<SubscriptionHistoryEntity[]>;

  findManualActions(options?: {
    limit?: number;
    offset?: number;
    date_from?: Date;
    date_to?: Date;
  }): Promise<SubscriptionHistoryEntity[]>;

  findPlanChanges(
    subscriptionId?: number,
    options?: {
      limit?: number;
      offset?: number;
      date_from?: Date;
      date_to?: Date;
    }
  ): Promise<SubscriptionHistoryEntity[]>;

  findStatusChanges(
    subscriptionId?: number,
    options?: {
      limit?: number;
      offset?: number;
      date_from?: Date;
      date_to?: Date;
    }
  ): Promise<SubscriptionHistoryEntity[]>;

  getStatistics(
    subscriptionId?: number,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<SubscriptionHistoryStats>;

  getTimeline(
    subscriptionId: number,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<SubscriptionHistoryEntity[]>;

  // Método utilitário para registrar ações automaticamente
  logAction(data: {
    subscription_id: number;
    action: SubscriptionHistoryAction;
    previous_status?: string;
    new_status?: string;
    previous_plan_id?: number;
    new_plan_id?: number;
    reason?: string;
    metadata?: Record<string, unknown>;
    created_by?: number;
    automated?: boolean;
    notes?: string;
    ip_address?: string;
    user_agent?: string;
  }): Promise<SubscriptionHistoryEntity>;
}
