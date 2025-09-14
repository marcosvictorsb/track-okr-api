import { ModelStatic } from 'sequelize';
import { SupportContactEntity } from '../entity';
import SupportContactModel from '../model/support-contact.model';

export type CreateSupportContactCriteria = {
  user_id?: number | null;
  company_id?: number | null;
  contact_preference: string;
  contact_value: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
  assigned_to?: number | null;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type FindSupportContactCriteria = {
  id?: number;
  user_id?: number;
  company_id?: number;
  status?:
    | 'new'
    | 'in_progress'
    | 'waiting_user'
    | 'resolved'
    | 'closed'
    | Array<string>;
  priority?: 'low' | 'medium' | 'high' | 'urgent' | Array<string>;
  assigned_to?: number;
};

export type UpdateSupportContactCriteria = {
  id: number;
  status?: 'new' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: number | null;
  metadata?: Record<string, unknown> | null;
  resolved_at?: Date | null;
};

export type DeleteSupportContactCriteria = {
  id: number;
};

export type SupportContactRepositoryDependencies = {
  model: ModelStatic<SupportContactModel>;
};

export interface ISupportContactRepository {
  create(criteria: CreateSupportContactCriteria): Promise<SupportContactEntity>;
  find(
    criteria: FindSupportContactCriteria
  ): Promise<SupportContactEntity | undefined>;
  findAll(
    criteria: FindSupportContactCriteria
  ): Promise<SupportContactEntity[]>;
  update(
    data: Partial<UpdateSupportContactCriteria>,
    criteria: UpdateSupportContactCriteria
  ): Promise<boolean>;
  delete(criteria: DeleteSupportContactCriteria): Promise<boolean>;
  count(criteria: FindSupportContactCriteria): Promise<number>;
}
