export class SupportContactEntity {
  public readonly id?: number;
  public readonly user_id?: number | null;
  public readonly company_id?: number | null;
  public readonly name?: string;
  public readonly contact_preference: string;
  public readonly contact_value: string;
  public readonly message: string;
  public readonly priority: 'low' | 'medium' | 'high' | 'urgent';
  public readonly status:
    | 'new'
    | 'in_progress'
    | 'waiting_user'
    | 'resolved'
    | 'closed';
  public readonly assigned_to?: number | null;
  public readonly ip_address?: string | null;
  public readonly user_agent?: string | null;
  public readonly metadata?: Record<string, unknown> | null;
  public readonly resolved_at?: Date | string | null;
  public readonly created_at?: Date | string;
  public readonly updated_at?: Date | string | null;
  public readonly deleted_at?: Date | string | null;

  constructor(params: {
    id?: number;
    user_id?: number | null;
    company_id?: number | null;
    name?: string;
    contact_preference: string;
    contact_value: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'new' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
    assigned_to?: number | null;
    ip_address?: string | null;
    user_agent?: string | null;
    metadata?: Record<string, unknown> | null;
    resolved_at?: Date | string | null;
    created_at?: Date | string;
    updated_at?: Date | string | null;
    deleted_at?: Date | string | null;
  }) {
    this.id = params.id;
    this.user_id = params.user_id;
    this.company_id = params.company_id;
    this.name = params.name;
    this.contact_preference = params.contact_preference;
    this.contact_value = params.contact_value;
    this.message = params.message;
    this.priority = params.priority;
    this.status = params.status;
    this.assigned_to = params.assigned_to;
    this.ip_address = params.ip_address;
    this.user_agent = params.user_agent;
    this.metadata = params.metadata;
    this.resolved_at = params.resolved_at;
    this.created_at = params.created_at;
    this.updated_at = params.updated_at;
    this.deleted_at = params.deleted_at;
  }
}
