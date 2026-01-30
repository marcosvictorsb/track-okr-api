export class CompanyEntity {
  public readonly id?: number;
  public readonly name: string;
  public readonly cnpj?: string;
  public readonly website?: string;
  public readonly created_at?: Date;
  public readonly updated_at?: Date | null;
  public readonly deleted_at?: Date | null;

  constructor(params: {
    id?: number;
    name: string;
    cnpj?: string;
    website?: string;
    created_at?: Date;
    updated_at?: Date | null;
    deleted_at?: Date | null;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.cnpj = params.cnpj;
    this.website = params.website;
    this.created_at = params.created_at;
    this.updated_at = params.updated_at;
    this.deleted_at = params.deleted_at;
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      cnpj: this.cnpj,
      website: this.website,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at
    };
  }

  public isValidCnpj(): boolean {
    return this.cnpj?.length === 14;
  }
}
