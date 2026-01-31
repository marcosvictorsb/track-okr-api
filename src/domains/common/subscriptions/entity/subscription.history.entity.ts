import { SubscriptionHistoryAction } from '../model/subscription.history.model';

export class SubscriptionHistoryEntity {
  public readonly id?: number;
  public readonly subscription_id: number;
  public readonly action: SubscriptionHistoryAction;
  public readonly previous_status?: string;
  public readonly new_status?: string;
  public readonly previous_plan_id?: number;
  public readonly new_plan_id?: number;
  public readonly reason?: string;
  public readonly metadata?: Record<string, unknown>;
  public readonly ip_address?: string;
  public readonly user_agent?: string;
  public readonly created_by?: number;
  public readonly automated: boolean;
  public readonly notes?: string;
  public readonly created_at?: Date;

  constructor(data: {
    id?: number;
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
    automated: boolean;
    notes?: string;
    created_at?: Date;
  }) {
    this.id = data.id;
    this.subscription_id = data.subscription_id;
    this.action = data.action;
    this.previous_status = data.previous_status;
    this.new_status = data.new_status;
    this.previous_plan_id = data.previous_plan_id;
    this.new_plan_id = data.new_plan_id;
    this.reason = data.reason;
    this.metadata = data.metadata;
    this.ip_address = data.ip_address;
    this.user_agent = data.user_agent;
    this.created_by = data.created_by;
    this.automated = data.automated;
    this.notes = data.notes;
    this.created_at = data.created_at;
  }

  public isAutomated(): boolean {
    return this.automated;
  }

  public isManual(): boolean {
    return !this.automated && this.created_by !== undefined;
  }

  public isPlanChange(): boolean {
    return (
      this.action === 'plan_changed' ||
      this.action === 'upgraded' ||
      this.action === 'downgraded'
    );
  }

  public isStatusChange(): boolean {
    return (
      this.previous_status !== undefined &&
      this.new_status !== undefined &&
      this.previous_status !== this.new_status
    );
  }

  public isTrialAction(): boolean {
    return (
      this.action === 'trial_started' ||
      this.action === 'trial_extended' ||
      this.action === 'trial_converted'
    );
  }

  public isCancellationAction(): boolean {
    return (
      this.action === 'canceled' ||
      this.action === 'suspended' ||
      this.action === 'expired'
    );
  }

  public isActivationAction(): boolean {
    return (
      this.action === 'activated' ||
      this.action === 'reactivated' ||
      this.action === 'created'
    );
  }

  public getActionContext(): {
    isAutomated: boolean;
    hasUser: boolean;
    hasMetadata: boolean;
    hasReason: boolean;
    timestamp: Date | undefined;
  } {
    return {
      isAutomated: this.automated,
      hasUser: this.created_by !== undefined,
      hasMetadata:
        this.metadata !== undefined && Object.keys(this.metadata).length > 0,
      hasReason: this.reason !== undefined && this.reason.trim().length > 0,
      timestamp: this.created_at
    };
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      subscription_id: this.subscription_id,
      action: this.action,
      previous_status: this.previous_status,
      new_status: this.new_status,
      previous_plan_id: this.previous_plan_id,
      new_plan_id: this.new_plan_id,
      reason: this.reason,
      metadata: this.metadata,
      ip_address: this.ip_address,
      user_agent: this.user_agent,
      created_by: this.created_by,
      automated: this.automated,
      notes: this.notes,
      created_at: this.created_at
    };
  }
}
