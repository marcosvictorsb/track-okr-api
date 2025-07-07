export interface IObjectiveEntity {
  id?: number;
  title: string;
  description?: string;
  id_team: number;
  team_name?: string;
  status: 'active' | 'cancelled' | 'completed';
  quarter: number;
  year: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export class ObjectiveEntity implements IObjectiveEntity {
  readonly id?: number;
  readonly title: string;
  readonly description?: string;
  readonly id_team: number;
  team_name?: string;
  readonly status: 'active' | 'cancelled' | 'completed';
  readonly quarter: number;
  readonly year: number;
  readonly created_at?: Date;
  readonly updated_at?: Date;
  readonly deleted_at?: Date;

  constructor(data: IObjectiveEntity) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.id_team = data.id_team;
    this.team_name = data.team_name;
    this.status = data.status;
    this.quarter = data.quarter;
    this.year = data.year;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.deleted_at = data.deleted_at;
  }

  public toJson(): IObjectiveEntity {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      id_team: this.id_team,
      status: this.status,
      quarter: this.quarter,
      year: this.year,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at
    };
  }
}
