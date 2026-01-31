export type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'canceled'
  | 'expired'
  | 'suspended'
  | 'pending_activation';

export class SubscriptionEntity {
  public readonly id?: number;
  public readonly company_id: number;
  public readonly plan_id: number;
  public readonly status: SubscriptionStatus;
  public readonly trial_start_date?: Date;
  public readonly trial_end_date?: Date;
  public readonly started_at: Date;
  public readonly expires_at?: Date;
  public readonly canceled_at?: Date;
  public readonly suspended_at?: Date;
  public readonly grace_period_ends_at?: Date;
  public readonly auto_renew: boolean;
  public readonly cancellation_reason?: string;
  public readonly created_by?: number;
  public readonly notes?: string;
  public readonly created_at?: Date;
  public readonly updated_at?: Date;

  constructor(data: {
    id?: number;
    company_id: number;
    plan_id: number;
    status: SubscriptionStatus;
    trial_start_date?: Date;
    trial_end_date?: Date;
    started_at: Date;
    expires_at?: Date;
    canceled_at?: Date;
    suspended_at?: Date;
    grace_period_ends_at?: Date;
    auto_renew: boolean;
    cancellation_reason?: string;
    created_by?: number;
    notes?: string;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = data.id;
    this.company_id = data.company_id;
    this.plan_id = data.plan_id;
    this.status = data.status;
    this.trial_start_date = data.trial_start_date;
    this.trial_end_date = data.trial_end_date;
    this.started_at = data.started_at;
    this.expires_at = data.expires_at;
    this.canceled_at = data.canceled_at;
    this.suspended_at = data.suspended_at;
    this.grace_period_ends_at = data.grace_period_ends_at;
    this.auto_renew = data.auto_renew;
    this.cancellation_reason = data.cancellation_reason;
    this.created_by = data.created_by;
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  public isActive(): boolean {
    return this.status === 'active';
  }

  public isTrial(): boolean {
    return this.status === 'trial';
  }

  public isCanceled(): boolean {
    return this.status === 'canceled';
  }

  public isExpired(): boolean {
    return (
      this.status === 'expired' ||
      ((this.expires_at && this.expires_at < new Date()) as boolean)
    );
  }

  public isSuspended(): boolean {
    return this.status === 'suspended';
  }

  public isInGracePeriod(): boolean {
    if (!this.grace_period_ends_at) return false;
    return new Date() <= this.grace_period_ends_at;
  }

  public isTrialExpired(): boolean {
    if (!this.trial_end_date) return false;
    return new Date() > this.trial_end_date;
  }

  public daysUntilExpiration(): number | null {
    if (!this.expires_at) return null;
    const now = new Date();
    const diffTime = this.expires_at.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public daysUntilTrialExpiration(): number | null {
    if (!this.trial_end_date) return null;
    const now = new Date();
    const diffTime = this.trial_end_date.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
