export interface ISettingEntity {
  id?: number;
  block_okr_creation: boolean;
  block_key_result_creation: boolean;
  block_okr_editing: boolean;
  block_key_result_editing: boolean;
  allowed_quarters: number[];
  current_quarter_only: boolean;
  id_company: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export class SettingEntity implements ISettingEntity {
  public readonly id?: number;
  public readonly block_okr_creation: boolean;
  public readonly block_key_result_creation: boolean;
  public readonly block_okr_editing: boolean;
  public readonly block_key_result_editing: boolean;
  public readonly allowed_quarters: number[];
  public readonly current_quarter_only: boolean;
  public readonly id_company: number;
  public readonly created_at?: Date;
  public readonly updated_at?: Date;
  public readonly deleted_at?: Date;

  constructor(params: ISettingEntity) {
    this.id = params.id;
    this.block_okr_creation = params.block_okr_creation;
    this.block_key_result_creation = params.block_key_result_creation;
    this.block_okr_editing = params.block_okr_editing;
    this.block_key_result_editing = params.block_key_result_editing;
    this.allowed_quarters = params.allowed_quarters;
    this.current_quarter_only = params.current_quarter_only;
    this.id_company = params.id_company;
    this.created_at = params.created_at;
    this.updated_at = params.updated_at;
    this.deleted_at = params.deleted_at;
  }

  // Métodos auxiliares
  public isOkrCreationBlocked(): boolean {
    return this.block_okr_creation;
  }

  public isKeyResultCreationBlocked(): boolean {
    return this.block_key_result_creation;
  }

  public isOkrEditingBlocked(): boolean {
    return this.block_okr_editing;
  }

  public isKeyResultEditingBlocked(): boolean {
    return this.block_key_result_editing;
  }

  public isQuarterAllowed(quarter: number): boolean {
    return this.allowed_quarters.includes(quarter);
  }

  public isCurrentQuarterOnly(): boolean {
    return this.current_quarter_only;
  }

  public toJSON(): ISettingEntity {
    return {
      id: this.id,
      block_okr_creation: this.block_okr_creation,
      block_key_result_creation: this.block_key_result_creation,
      block_okr_editing: this.block_okr_editing,
      block_key_result_editing: this.block_key_result_editing,
      allowed_quarters: this.allowed_quarters,
      current_quarter_only: this.current_quarter_only,
      id_company: this.id_company,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at
    };
  }
}
