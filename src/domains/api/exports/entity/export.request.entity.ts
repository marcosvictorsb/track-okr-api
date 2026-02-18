export class ExportRequestEntity {
  public readonly id?: number;
  public readonly id_user: number;
  public readonly email: string;
  public readonly status: string;
  public readonly id_company: number;
  public readonly requested_at: Date;
  public readonly completed_at?: Date | null;
  public readonly error_message?: string | null;
  public readonly created_at?: Date;
  public readonly updated_at?: Date | null;
  public readonly deleted_at?: Date | null;

  constructor(params: {
    id?: number;
    id_user: number;
    email: string;
    status: string;
    id_company: number;
    requested_at: Date;
    completed_at?: Date | null;
    error_message?: string | null;
    created_at?: Date;
    updated_at?: Date | null;
    deleted_at?: Date | null;
  }) {
    this.id = params.id;
    this.id_user = params.id_user;
    this.email = params.email;
    this.status = params.status;
    this.id_company = params.id_company;
    this.requested_at = params.requested_at;
    this.completed_at = params.completed_at;
    this.error_message = params.error_message;
    this.created_at = params.created_at;
    this.updated_at = params.updated_at;
    this.deleted_at = params.deleted_at;
  }
}
