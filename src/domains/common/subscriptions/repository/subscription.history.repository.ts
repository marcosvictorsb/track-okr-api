import { ModelStatic, Op, WhereOptions } from 'sequelize';
import { SubscriptionHistoryEntity } from '../entity/subscription.history.entity';
import {
  CreateSubscriptionHistoryCriteria,
  FindSubscriptionHistoryCriteria,
  ISubscriptionHistoryRepository,
  PaginatedSubscriptionHistory,
  SubscriptionHistoryFilters,
  SubscriptionHistoryPagination,
  SubscriptionHistoryRepositoryDependencies,
  SubscriptionHistorySort,
  SubscriptionHistoryStats
} from '../interfaces/subscription.history.interfaces';
import SubscriptionHistoryModel, {
  SubscriptionHistoryAction
} from '../model/subscription.history.model';

export class SubscriptionHistoryRepository implements ISubscriptionHistoryRepository {
  protected model: ModelStatic<SubscriptionHistoryModel>;

  constructor(params: SubscriptionHistoryRepositoryDependencies) {
    this.model = params.model;
  }

  private getConditions(
    criteria: FindSubscriptionHistoryCriteria
  ): WhereOptions {
    const whereConditions: WhereOptions = {};

    if (criteria.id) {
      whereConditions['id'] = criteria.id;
    }

    if (criteria.subscription_id) {
      whereConditions['subscription_id'] = criteria.subscription_id;
    }

    if (criteria.action) {
      if (Array.isArray(criteria.action)) {
        whereConditions['action'] = { [Op.in]: criteria.action };
      } else {
        whereConditions['action'] = criteria.action;
      }
    }

    if (criteria.created_by) {
      whereConditions['created_by'] = criteria.created_by;
    }

    if (criteria.automated !== undefined) {
      whereConditions['automated'] = criteria.automated;
    }

    // Filtros de data
    if (criteria.date_from || criteria.date_to) {
      const dateConditions: Record<symbol, Date> = {};
      if (criteria.date_from) {
        dateConditions[Op.gte] = criteria.date_from;
      }
      if (criteria.date_to) {
        dateConditions[Op.lte] = criteria.date_to;
      }
      whereConditions['created_at'] = dateConditions;
    }

    return whereConditions;
  }

  private getFiltersConditions(
    filters: SubscriptionHistoryFilters
  ): WhereOptions {
    const whereConditions: WhereOptions = {};

    if (filters.subscription_ids?.length) {
      whereConditions['subscription_id'] = {
        [Op.in]: filters.subscription_ids
      };
    }

    if (filters.actions?.length) {
      whereConditions['action'] = { [Op.in]: filters.actions };
    }

    if (filters.user_ids?.length) {
      whereConditions['created_by'] = { [Op.in]: filters.user_ids };
    }

    if (filters.automated_only) {
      whereConditions['automated'] = true;
    }

    if (filters.manual_only) {
      whereConditions['automated'] = false;
      whereConditions['created_by'] = { [Op.ne]: null };
    }

    if (filters.with_metadata) {
      whereConditions['metadata'] = { [Op.ne]: null };
    }

    if (filters.plan_changes_only) {
      whereConditions['action'] = {
        [Op.in]: ['upgraded', 'downgraded', 'plan_changed']
      };
    }

    if (filters.status_changes_only) {
      whereConditions['previous_status'] = { [Op.ne]: null };
      whereConditions['new_status'] = { [Op.ne]: null };
    }

    if (filters.trial_actions_only) {
      whereConditions['action'] = {
        [Op.in]: ['trial_started', 'trial_extended', 'trial_converted']
      };
    }

    return whereConditions;
  }

  async create(
    data: CreateSubscriptionHistoryCriteria
  ): Promise<SubscriptionHistoryEntity> {
    const historyData = {
      ...data,
      automated: data.automated !== undefined ? data.automated : false,
      created_at: new Date()
    };

    const history = await this.model.create(historyData);
    return new SubscriptionHistoryEntity(history.toJSON());
  }

  async find(
    criteria: FindSubscriptionHistoryCriteria
  ): Promise<SubscriptionHistoryEntity | undefined> {
    const history = await this.model.findOne({
      where: this.getConditions(criteria),
      raw: true
    });

    if (!history) return undefined;
    return new SubscriptionHistoryEntity(history);
  }

  async findAll(
    criteria: FindSubscriptionHistoryCriteria = {}
  ): Promise<SubscriptionHistoryEntity[]> {
    const options: {
      where: WhereOptions;
      order: [string, string][];
      raw: boolean;
      limit?: number;
      offset?: number;
    } = {
      where: this.getConditions(criteria),
      order: [['created_at', 'DESC']],
      raw: true
    };

    if (criteria.limit) {
      options.limit = criteria.limit;
    }

    if (criteria.offset) {
      options.offset = criteria.offset;
    }

    const histories = await this.model.findAll(options);

    return histories.map((history) => new SubscriptionHistoryEntity(history));
  }

  async delete(id: number): Promise<boolean> {
    const affectedRows = await this.model.destroy({
      where: { id }
    });

    return affectedRows > 0;
  }

  async findBySubscription(
    subscriptionId: number,
    options: {
      limit?: number;
      offset?: number;
      sort?: SubscriptionHistorySort;
    } = {}
  ): Promise<SubscriptionHistoryEntity[]> {
    const sortField = options.sort?.field || 'created_at';
    const sortDirection = options.sort?.direction || 'DESC';

    const queryOptions: {
      where: WhereOptions;
      order: [string, string][];
      raw: boolean;
      limit?: number;
      offset?: number;
    } = {
      where: { subscription_id: subscriptionId },
      order: [[sortField, sortDirection]],
      raw: true
    };

    if (options.limit) {
      queryOptions.limit = options.limit;
    }

    if (options.offset) {
      queryOptions.offset = options.offset;
    }

    const histories = await this.model.findAll(queryOptions);
    return histories.map((history) => new SubscriptionHistoryEntity(history));
  }

  async findBySubscriptionPaginated(
    subscriptionId: number,
    pagination: SubscriptionHistoryPagination,
    filters: SubscriptionHistoryFilters = {},
    sort: SubscriptionHistorySort = { field: 'created_at', direction: 'DESC' }
  ): Promise<PaginatedSubscriptionHistory> {
    const whereConditions = {
      subscription_id: subscriptionId,
      ...this.getFiltersConditions(filters)
    };

    const offset = (pagination.page - 1) * pagination.limit;

    const { count, rows } = await this.model.findAndCountAll({
      where: whereConditions,
      order: [[sort.field, sort.direction]],
      limit: pagination.limit,
      offset,
      raw: true
    });

    const totalPages = Math.ceil(count / pagination.limit);

    return {
      data: rows.map((history) => new SubscriptionHistoryEntity(history)),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: count,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1
      }
    };
  }

  async findByAction(
    action: SubscriptionHistoryAction,
    options: {
      limit?: number;
      offset?: number;
      date_from?: Date;
      date_to?: Date;
    } = {}
  ): Promise<SubscriptionHistoryEntity[]> {
    const whereConditions: WhereOptions = { action };

    if (options.date_from || options.date_to) {
      const dateConditions: any = {};
      if (options.date_from) {
        dateConditions[Op.gte] = options.date_from;
      }
      if (options.date_to) {
        dateConditions[Op.lte] = options.date_to;
      }
      whereConditions['created_at'] = dateConditions;
    }

    const queryOptions: any = {
      where: whereConditions,
      order: [['created_at', 'DESC']],
      raw: true
    };

    if (options.limit) {
      queryOptions.limit = options.limit;
    }

    if (options.offset) {
      queryOptions.offset = options.offset;
    }

    const histories = await this.model.findAll(queryOptions);
    return histories.map((history) => new SubscriptionHistoryEntity(history));
  }

  async findByUser(
    userId: number,
    options: {
      limit?: number;
      offset?: number;
      subscription_id?: number;
    } = {}
  ): Promise<SubscriptionHistoryEntity[]> {
    const whereConditions: WhereOptions = { created_by: userId };

    if (options.subscription_id) {
      whereConditions['subscription_id'] = options.subscription_id;
    }

    const queryOptions: any = {
      where: whereConditions,
      order: [['created_at', 'DESC']],
      raw: true
    };

    if (options.limit) {
      queryOptions.limit = options.limit;
    }

    if (options.offset) {
      queryOptions.offset = options.offset;
    }

    const histories = await this.model.findAll(queryOptions);
    return histories.map((history) => new SubscriptionHistoryEntity(history));
  }

  async findAutomatedActions(
    options: {
      limit?: number;
      offset?: number;
      date_from?: Date;
      date_to?: Date;
    } = {}
  ): Promise<SubscriptionHistoryEntity[]> {
    return this.findAll({
      automated: true,
      limit: options.limit,
      offset: options.offset,
      date_from: options.date_from,
      date_to: options.date_to
    });
  }

  async findManualActions(
    options: {
      limit?: number;
      offset?: number;
      date_from?: Date;
      date_to?: Date;
    } = {}
  ): Promise<SubscriptionHistoryEntity[]> {
    const whereConditions: WhereOptions = {
      automated: false,
      created_by: { [Op.ne]: null }
    };

    if (options.date_from || options.date_to) {
      const dateConditions: any = {};
      if (options.date_from) {
        dateConditions[Op.gte] = options.date_from;
      }
      if (options.date_to) {
        dateConditions[Op.lte] = options.date_to;
      }
      whereConditions['created_at'] = dateConditions;
    }

    const queryOptions: any = {
      where: whereConditions,
      order: [['created_at', 'DESC']],
      raw: true
    };

    if (options.limit) {
      queryOptions.limit = options.limit;
    }

    if (options.offset) {
      queryOptions.offset = options.offset;
    }

    const histories = await this.model.findAll(queryOptions);
    return histories.map((history) => new SubscriptionHistoryEntity(history));
  }

  async findPlanChanges(
    subscriptionId?: number,
    options: {
      limit?: number;
      offset?: number;
      date_from?: Date;
      date_to?: Date;
    } = {}
  ): Promise<SubscriptionHistoryEntity[]> {
    const whereConditions: WhereOptions = {
      action: { [Op.in]: ['upgraded', 'downgraded', 'plan_changed'] }
    };

    if (subscriptionId) {
      whereConditions['subscription_id'] = subscriptionId;
    }

    if (options.date_from || options.date_to) {
      const dateConditions: any = {};
      if (options.date_from) {
        dateConditions[Op.gte] = options.date_from;
      }
      if (options.date_to) {
        dateConditions[Op.lte] = options.date_to;
      }
      whereConditions['created_at'] = dateConditions;
    }

    const queryOptions: any = {
      where: whereConditions,
      order: [['created_at', 'DESC']],
      raw: true
    };

    if (options.limit) {
      queryOptions.limit = options.limit;
    }

    if (options.offset) {
      queryOptions.offset = options.offset;
    }

    const histories = await this.model.findAll(queryOptions);
    return histories.map((history) => new SubscriptionHistoryEntity(history));
  }

  async findStatusChanges(
    subscriptionId?: number,
    options: {
      limit?: number;
      offset?: number;
      date_from?: Date;
      date_to?: Date;
    } = {}
  ): Promise<SubscriptionHistoryEntity[]> {
    const whereConditions: WhereOptions = {
      previous_status: { [Op.ne]: null },
      new_status: { [Op.ne]: null }
    };

    if (subscriptionId) {
      whereConditions['subscription_id'] = subscriptionId;
    }

    if (options.date_from || options.date_to) {
      const dateConditions: any = {};
      if (options.date_from) {
        dateConditions[Op.gte] = options.date_from;
      }
      if (options.date_to) {
        dateConditions[Op.lte] = options.date_to;
      }
      whereConditions['created_at'] = dateConditions;
    }

    const queryOptions: any = {
      where: whereConditions,
      order: [['created_at', 'DESC']],
      raw: true
    };

    if (options.limit) {
      queryOptions.limit = options.limit;
    }

    if (options.offset) {
      queryOptions.offset = options.offset;
    }

    const histories = await this.model.findAll(queryOptions);
    return histories.map((history) => new SubscriptionHistoryEntity(history));
  }

  async getStatistics(
    subscriptionId?: number,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<SubscriptionHistoryStats> {
    const whereConditions: WhereOptions = {};

    if (subscriptionId) {
      whereConditions['subscription_id'] = subscriptionId;
    }

    if (dateFrom || dateTo) {
      const dateConditions: any = {};
      if (dateFrom) {
        dateConditions[Op.gte] = dateFrom;
      }
      if (dateTo) {
        dateConditions[Op.lte] = dateTo;
      }
      whereConditions['created_at'] = dateConditions;
    }

    // Buscar todos os registros para calcular estatísticas
    const histories = await this.model.findAll({
      where: whereConditions,
      raw: true,
      attributes: ['action', 'automated', 'created_at']
    });

    const totalRecords = histories.length;
    const automatedActions = histories.filter((h) => h.automated).length;
    const manualActions = totalRecords - automatedActions;

    // Contar ações por tipo
    const actionCounts: Record<string, number> = {};
    histories.forEach((history) => {
      actionCounts[history.action] = (actionCounts[history.action] || 0) + 1;
    });

    // Encontrar ação mais comum
    const mostCommonAction = Object.entries(actionCounts).reduce((a, b) =>
      actionCounts[a[0]] > actionCounts[b[0]] ? a : b
    )?.[0] as SubscriptionHistoryAction;

    // Timeline por dia (últimos 30 dias se não especificado)
    const timelineData: { date: string; count: number }[] = [];
    const endDate = dateTo || new Date();
    const startDate =
      dateFrom || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Agrupar por data
    const dailyCounts: Record<string, number> = {};
    histories.forEach((history) => {
      const date = new Date(history.created_at).toISOString().split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    // Preencher timeline
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split('T')[0];
      timelineData.push({
        date: dateStr,
        count: dailyCounts[dateStr] || 0
      });
    }

    return {
      total_records: totalRecords,
      automated_actions: automatedActions,
      manual_actions: manualActions,
      most_common_action: mostCommonAction,
      actions_by_type: actionCounts as Record<
        SubscriptionHistoryAction,
        number
      >,
      timeline: timelineData
    };
  }

  async getTimeline(
    subscriptionId: number,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<SubscriptionHistoryEntity[]> {
    const whereConditions: WhereOptions = { subscription_id: subscriptionId };

    if (dateFrom || dateTo) {
      const dateConditions: any = {};
      if (dateFrom) {
        dateConditions[Op.gte] = dateFrom;
      }
      if (dateTo) {
        dateConditions[Op.lte] = dateTo;
      }
      whereConditions['created_at'] = dateConditions;
    }

    const histories = await this.model.findAll({
      where: whereConditions,
      order: [['created_at', 'ASC']], // Timeline em ordem cronológica
      raw: true
    });

    return histories.map((history) => new SubscriptionHistoryEntity(history));
  }

  async logAction(data: {
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
  }): Promise<SubscriptionHistoryEntity> {
    return this.create({
      subscription_id: data.subscription_id,
      action: data.action,
      previous_status: data.previous_status,
      new_status: data.new_status,
      previous_plan_id: data.previous_plan_id,
      new_plan_id: data.new_plan_id,
      reason: data.reason,
      metadata: data.metadata,
      created_by: data.created_by,
      automated: data.automated || false,
      notes: data.notes,
      ip_address: data.ip_address,
      user_agent: data.user_agent
    });
  }
}
