import { ResultKeyEntity } from '@domains/api/results-keys/entity/result-key.entity';

export interface IObjectiveEntity {
  id?: number;
  title: string;
  description?: string;
  id_team: number;
  team_name?: string;
  id_company?: number;
  company_name?: string;
  status: string; //'active' | 'cancelled' | 'completed';
  quarter: number;
  year: number;
  id_planner?: number;
  result_keys?: ResultKeyEntity[];
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
  id_company?: number;
  company_name?: string;
  status: string; //'active' | 'cancelled' | 'completed';
  readonly quarter: number;
  readonly year: number;
  id_planner?: number;
  result_keys?: ResultKeyEntity[];
  readonly created_at?: Date;
  readonly updated_at?: Date;
  readonly deleted_at?: Date;

  constructor(data: IObjectiveEntity) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.id_team = data.id_team;
    this.team_name = data.team_name;
    this.id_company = data.id_company;
    this.company_name = data.company_name;
    this.status = data.status;
    this.quarter = data.quarter;
    this.year = data.year;
    this.id_planner = data.id_planner;
    this.result_keys = data.result_keys;
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
      team_name: this.team_name,
      id_company: this.id_company,
      company_name: this.company_name,
      status: this.status,
      quarter: this.quarter,
      year: this.year,
      id_planner: this.id_planner,
      result_keys: this.result_keys,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at
    };
  }
}
