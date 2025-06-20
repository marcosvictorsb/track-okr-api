export class CompanyEntity {
  public readonly id?: number;
  public readonly name: string;
  public readonly cnpj: string;
  public readonly created_at?: Date;
  public readonly updated_at?: Date | null;
  public readonly deleted_at?: Date | null;

  constructor(params: {
    id?: number;
    name: string;
    cnpj: string;
    created_at?: Date;
    updated_at?: Date | null;
    deleted_at?: Date | null;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.cnpj = params.cnpj;
    this.created_at = params.created_at;
    this.updated_at = params.updated_at;
    this.deleted_at = params.deleted_at;
  }

  /**
   * Factory method para criar instância da entity
   * @param params Dados parciais da company
   * @returns Nova instância de CompanyEntity
   */
  public static create(params: Partial<CompanyEntity> = {}): CompanyEntity {
    return new CompanyEntity({
      name: params.name || '',
      cnpj: params.cnpj || '',
      ...params
    });
  }

  /**
   * Converte a entity para objeto simples
   * @returns Objeto com as propriedades da entity
   */
  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      cnpj: this.cnpj,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at
    };
  }

  /**
   * Valida se o CNPJ está no formato correto
   * @returns true se o CNPJ for válido
   */
  public isValidCnpj(): boolean {
    // Implementação básica - pode ser expandida
    return this.cnpj?.length === 14; // Apenas verifica tamanho
  }
}