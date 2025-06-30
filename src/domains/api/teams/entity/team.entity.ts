export class TeamEntity {
  public readonly id?: number;
  public readonly name: string;
  public readonly description: string;
  public readonly amount_users: number;
  public readonly id_company: number;
  public readonly created_at?: Date;
  public readonly updated_at?: Date | null;
  public readonly deleted_at?: Date | null;

  constructor(params: {
    id?: number;
    name: string;
    description: string;
    amount_users: number;
    id_company: number;
    created_at?: Date;
    updated_at?: Date | null;
    deleted_at?: Date | null;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.description = params.description;
    this.amount_users = params.amount_users;
    this.id_company = params.id_company;
    this.created_at = params.created_at;
    this.updated_at = params.updated_at;
    this.deleted_at = params.deleted_at;
  }
}
