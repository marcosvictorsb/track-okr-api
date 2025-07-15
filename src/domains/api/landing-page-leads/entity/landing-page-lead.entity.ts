export class LandingPageLeadEntity {
  public readonly id?: number;
  public readonly name: string;
  public readonly email: string;
  public readonly company?: string | null;
  public readonly phone?: string | null;
  public readonly position?: string | null;
  public readonly company_size?: string | null;
  public readonly source: string;
  public readonly page_url?: string | null;
  public readonly user_agent?: string | null;
  public readonly ip_address?: string | null;
  public readonly utm_source?: string | null;
  public readonly utm_medium?: string | null;
  public readonly utm_campaign?: string | null;
  public readonly utm_term?: string | null;
  public readonly utm_content?: string | null;
  public readonly status:
    | 'new'
    | 'contacted'
    | 'qualified'
    | 'converted'
    | 'lost';
  public readonly notes?: string | null;
  public readonly contacted_at?: Date | null;
  public readonly converted_at?: Date | null;
  public readonly created_at?: Date;
  public readonly updated_at?: Date | null;
  public readonly deleted_at?: Date | null;

  constructor(params: {
    id?: number;
    name: string;
    email: string;
    company?: string | null;
    phone?: string | null;
    position?: string | null;
    company_size?: string | null;
    source: string;
    page_url?: string | null;
    user_agent?: string | null;
    ip_address?: string | null;
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    utm_term?: string | null;
    utm_content?: string | null;
    status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
    notes?: string | null;
    contacted_at?: Date | null;
    converted_at?: Date | null;
    created_at?: Date;
    updated_at?: Date | null;
    deleted_at?: Date | null;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.email = params.email;
    this.company = params.company;
    this.phone = params.phone;
    this.position = params.position;
    this.company_size = params.company_size;
    this.source = params.source;
    this.page_url = params.page_url;
    this.user_agent = params.user_agent;
    this.ip_address = params.ip_address;
    this.utm_source = params.utm_source;
    this.utm_medium = params.utm_medium;
    this.utm_campaign = params.utm_campaign;
    this.utm_term = params.utm_term;
    this.utm_content = params.utm_content;
    this.status = params.status || 'new';
    this.notes = params.notes;
    this.contacted_at = params.contacted_at;
    this.converted_at = params.converted_at;
    this.created_at = params.created_at;
    this.updated_at = params.updated_at;
    this.deleted_at = params.deleted_at;
  }

  // Métodos de validação
  public isValidEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  public hasCompanyInfo(): boolean {
    return !!(this.company || this.position || this.company_size);
  }

  public hasPhone(): boolean {
    return !!(this.phone && this.phone.trim().length > 0);
  }

  public hasUTMTracking(): boolean {
    return !!(this.utm_source || this.utm_medium || this.utm_campaign);
  }

  // Métodos de status
  public isNew(): boolean {
    return this.status === 'new';
  }

  public isContacted(): boolean {
    return this.status === 'contacted';
  }

  public isQualified(): boolean {
    return this.status === 'qualified';
  }

  public isConverted(): boolean {
    return this.status === 'converted';
  }

  public isLost(): boolean {
    return this.status === 'lost';
  }

  // Métodos de formatação
  public getDisplayName(): string {
    return this.name;
  }

  public getCompanyDisplay(): string {
    const parts: string[] = [];
    if (this.company) parts.push(this.company);
    if (this.position) parts.push(this.position);
    if (this.company_size) parts.push(`(${this.company_size})`);
    return parts.join(' - ') || 'Empresa não informada';
  }

  public getUTMInfo(): string {
    const utmParts: string[] = [];
    if (this.utm_source) utmParts.push(`Source: ${this.utm_source}`);
    if (this.utm_medium) utmParts.push(`Medium: ${this.utm_medium}`);
    if (this.utm_campaign) utmParts.push(`Campaign: ${this.utm_campaign}`);
    if (this.utm_term) utmParts.push(`Term: ${this.utm_term}`);
    if (this.utm_content) utmParts.push(`Content: ${this.utm_content}`);
    return utmParts.join(', ') || 'Sem tracking UTM';
  }

  // Método para criar dados de tracking
  public static fromLandingPageData(data: {
    name: string;
    email: string;
    company?: string;
    position?: string;
    companySize?: string;
    source?: string;
    page_url?: string;
    user_agent?: string;
    ip_address?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  }): LandingPageLeadEntity {
    return new LandingPageLeadEntity({
      name: data.name,
      email: data.email,
      company: data.company || null,
      position: data.position || null,
      company_size: data.companySize || null,
      source: data.source || 'landing-page',
      page_url: data.page_url || null,
      user_agent: data.user_agent || null,
      ip_address: data.ip_address || null,
      utm_source: data.utm_source || null,
      utm_medium: data.utm_medium || null,
      utm_campaign: data.utm_campaign || null,
      utm_term: data.utm_term || null,
      utm_content: data.utm_content || null,
      status: 'new',
      created_at: new Date()
    });
  }
}
