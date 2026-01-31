export interface ICheckinsEntity {
  id?: number;
  id_result_key: number;
  previous_value?: number | null;
  new_value: number;
  comment?: string | null;
  id_user?: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  user_name?: string;
  result_key_name?: string;
}

export class CheckinsEntity implements ICheckinsEntity {
  readonly id?: number;
  readonly id_result_key: number;
  readonly previous_value?: number | null;
  readonly new_value: number;
  readonly comment?: string | null;
  readonly id_user?: number;
  readonly created_at?: Date;
  readonly updated_at?: Date;
  readonly deleted_at?: Date;

  user_name?: string;
  result_key_name?: string;

  constructor(data: ICheckinsEntity) {
    this.id = data.id;
    this.id_result_key = data.id_result_key;
    this.previous_value = data.previous_value;
    this.new_value = data.new_value;
    this.comment = data.comment;
    this.id_user = data.id_user;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.deleted_at = data.deleted_at;
    this.user_name = data.user_name;
    this.result_key_name = data.result_key_name;
  }

  public toJson(): ICheckinsEntity {
    return {
      id: this.id,
      id_result_key: this.id_result_key,
      previous_value: this.previous_value,
      new_value: this.new_value,
      comment: this.comment,
      id_user: this.id_user,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at,
      user_name: this.user_name,
      result_key_name: this.result_key_name
    };
  }

  public getDifference(): number {
    if (this.previous_value === null || this.previous_value === undefined) {
      return this.new_value;
    }
    return this.new_value - this.previous_value;
  }

  public getProgress(): string {
    const diff = this.getDifference();
    if (diff > 0) return 'positive';
    if (diff < 0) return 'negative';
    return 'neutral';
  }
}
