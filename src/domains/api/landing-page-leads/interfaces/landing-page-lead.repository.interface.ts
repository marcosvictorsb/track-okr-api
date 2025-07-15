import { LandingPageLeadEntity } from '../entity/landing-page-lead.entity';

export interface CreateLandingPageLeadData {
  name: string;
  email: string;
  company?: string;
  position?: string;
  company_size?: string;
  source?: string;
  page_url?: string;
  user_agent?: string;
  ip_address?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export interface UpdateLandingPageLeadData {
  status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  notes?: string;
  contacted_at?: Date;
  converted_at?: Date;
}

export interface FindLandingPageLeadCriteria {
  id?: number;
  email?: string;
  company?: string;
  status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source?: string;
  company_size?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  created_after?: Date;
  created_before?: Date;
  limit?: number;
  offset?: number;
}

export interface ILandingPageLeadRepository {
  create(data: CreateLandingPageLeadData): Promise<LandingPageLeadEntity>;
  findById(id: number): Promise<LandingPageLeadEntity | null>;
  findByEmail(email: string): Promise<LandingPageLeadEntity | null>;
  findAll(
    criteria?: FindLandingPageLeadCriteria
  ): Promise<LandingPageLeadEntity[]>;
  update(
    id: number,
    data: UpdateLandingPageLeadData
  ): Promise<LandingPageLeadEntity | null>;
  delete(id: number): Promise<boolean>;
  count(criteria?: FindLandingPageLeadCriteria): Promise<number>;
  findDuplicateByEmailAndCompany(
    email: string,
    company?: string
  ): Promise<LandingPageLeadEntity | null>;
}
