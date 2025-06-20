export class SubscriptionEntity {
  public readonly id?: number;
  public readonly id_company: string; // UUID
  public readonly amount_users: number;
  public readonly status: string; // 'active' | 'cancelled'
  public readonly id_external_payment: string;
  public readonly created_at?: Date;
  public readonly updated_at?: Date | null;
  public readonly deleted_at?: Date | null;

  constructor(params: {
    id?: number;
    id_company: string;
    amount_users: number;
    status: string;
    id_external_payment: string;
    created_at?: Date;
    updated_at?: Date | null;
    deleted_at?: Date | null;
  }) {
    this.id = params.id;
    this.id_company = params.id_company;
    this.amount_users = params.amount_users;
    this.status = params.status;
    this.id_external_payment = params.id_external_payment;
    this.created_at = params.created_at;
    this.updated_at = params.updated_at;
    this.deleted_at = params.deleted_at;
  }

  // Método opcional para criar instância vazia (padrão factory)
  public static create(params: Partial<SubscriptionEntity> = {}): SubscriptionEntity {
    return new SubscriptionEntity({
      id_company: params.id_company || '',
      amount_users: params.amount_users || 0,
      status: params.status || 'active',
      id_external_payment: params.id_external_payment || '',
      ...params
    });
  }

  // Método para serializar (opcional)
  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      id_company: this.id_company,
      amount_users: this.amount_users,
      status: this.status,
      id_external_payment: this.id_external_payment,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at
    };
  }
}