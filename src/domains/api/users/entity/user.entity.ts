export class UserEntity {
  public readonly id?: number;
  public readonly name: string;
  public readonly email: string;
  public readonly password_hash: string;
  public readonly role: string;
  public readonly status: string; // 'pending_activation' | 'active';
  public readonly id_company: number;
  public readonly created_at?: Date;
  public readonly updated_at?: Date | null;
  public readonly deleted_at?: Date | null;

  constructor(params: {
    id?: number;
    name: string;
    email: string;
    password_hash: string;
    role: string;
    status: string; //'pending_activation' | 'active';
    id_company: number;
    created_at?: Date;
    updated_at?: Date | null;
    deleted_at?: Date | null;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.email = params.email;
    this.password_hash = params.password_hash;
    this.role = params.role;
    this.status = params.status;
    this.id_company = params.id_company;
    this.created_at = params.created_at;
    this.updated_at = params.updated_at;
    this.deleted_at = params.deleted_at;
  }
}