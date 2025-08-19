export class PlanEntity {
  public readonly id?: number;
  public readonly name: string;
  public readonly description?: string;
  public readonly max_users: number;
  public readonly max_planners: number;
  public readonly max_teams: number;
  public readonly max_objectives_per_quarter: number;
  public readonly max_key_results_per_objective: number;
  public readonly isTrial: boolean;
  public readonly secret?: string;
  public readonly created_at?: Date;
  public readonly updated_at?: Date | null;
  public readonly deleted_at?: Date | null;

  constructor(params: {
    id?: number;
    name: string;
    description?: string;
    max_users: number;
    max_planners: number;
    max_teams: number;
    max_objectives_per_quarter: number;
    max_key_results_per_objective: number;
    isTrial?: boolean;
    secret?: string;
    created_at?: Date;
    updated_at?: Date | null;
    deleted_at?: Date | null;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.description = params.description;
    this.max_users = params.max_users;
    this.max_planners = params.max_planners;
    this.max_teams = params.max_teams;
    this.max_objectives_per_quarter = params.max_objectives_per_quarter;
    this.max_key_results_per_objective = params.max_key_results_per_objective;
    this.isTrial = params.isTrial ?? false;
    this.secret = params.secret;
    this.created_at = params.created_at;
    this.updated_at = params.updated_at;
    this.deleted_at = params.deleted_at;
  }
}
