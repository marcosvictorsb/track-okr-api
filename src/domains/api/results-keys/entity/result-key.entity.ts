export interface IResultKeyEntity {
  id?: number;
  name: string;
  initial_value: number;
  target_value: number;
  current_value: number;
  unit: string;
  responsible_users?: number[] | null;
  responsible_team_id?: number | null;
  id_okr?: number | null;
  status: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  team_name?: string;
  objective_title?: string;
  progress_percentage?: number;
  responsible_users_details?: Array<{ id: number; name: string }>;
}

export class ResultKeyEntity implements IResultKeyEntity {
  readonly id?: number;
  readonly name: string;
  readonly initial_value: number;
  readonly target_value: number;
  readonly current_value: number;
  readonly unit: string;
  readonly responsible_users?: number[] | null;
  readonly responsible_team_id?: number | null;
  readonly id_okr?: number | null;
  readonly status: string;
  readonly created_at?: Date;
  readonly updated_at?: Date;
  readonly deleted_at?: Date;

  team_name?: string;
  objective_title?: string;
  progress_percentage?: number;
  responsible_users_details?: Array<{ id: number; name: string }>;

  constructor(data: IResultKeyEntity) {
    this.id = data.id;
    this.name = data.name;
    this.initial_value = data.initial_value;
    this.target_value = data.target_value;
    this.current_value = data.current_value;
    this.unit = data.unit;
    this.responsible_users = data.responsible_users;
    this.responsible_team_id = data.responsible_team_id;
    this.id_okr = data.id_okr;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.deleted_at = data.deleted_at;

    this.team_name = data.team_name;
    this.objective_title = data.objective_title;
    this.progress_percentage = this.calculateProgress();
  }

  public toJson(): IResultKeyEntity {
    return {
      id: this.id,
      name: this.name,
      initial_value: this.initial_value,
      target_value: this.target_value,
      current_value: this.current_value,
      unit: this.unit,
      responsible_users: this.responsible_users,
      responsible_team_id: this.responsible_team_id,
      id_okr: this.id_okr,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at,
      team_name: this.team_name,
      objective_title: this.objective_title,
      progress_percentage: this.progress_percentage
    };
  }

  private calculateProgress(): number {
    if (this.target_value === 0) return 0;
    return Math.min(
      100,
      Math.max(
        0,
        ((this.current_value - this.initial_value) /
          (this.target_value - this.initial_value)) *
          100
      )
    );
  }

  public isCompleted(): boolean {
    return this.current_value >= this.target_value;
  }

  public isOverTarget(): boolean {
    return this.current_value > this.target_value;
  }

  public hasResponsibleUsers(): boolean {
    return !!(this.responsible_users && this.responsible_users.length > 0);
  }

  public hasResponsibleTeam(): boolean {
    return !!this.responsible_team_id;
  }

  public getRemainingValue(): number {
    return Math.max(0, this.target_value - this.current_value);
  }

  public getValueDifference(): number {
    return this.current_value - this.initial_value;
  }
}
