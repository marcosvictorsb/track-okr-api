import { CheckinsEntity } from '@domains/api/checkins/entity/checkins.entity';

export type ObjectiveStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type KeyResultStatus =
  | 'on_track'
  | 'attention'
  | 'at_risk'
  | 'completed'
  | 'no_data';
export type GranularityType = 'monthly' | 'weekly';

export interface PeriodInfo {
  progress: number;
  delta: number | null;
  status: KeyResultStatus;
  current_value: number;
  updated_at: string;
  update_count: number;
  has_manual_update: boolean;
}

export interface PeriodData {
  [period: string]: PeriodInfo | null;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface ResponsibleUser {
  id: number;
  name: string;
  photo_url?: string | null;
  position?: string | null;
}

export interface KeyResultEvolution {
  id: number;
  title: string;
  description?: string;
  unit: string;
  initial_value: number;
  target_value: number;
  current_value: number;
  progress: number;
  status: KeyResultStatus;
  responsible_id?: string;
  responsible_name?: string;
  periods: PeriodData;
  created_at: string;
  updated_at: string;
  last_update_at?: string;
  id_okr?: number;
  checkins?: CheckinsEntity[];
}

export interface ObjectiveEvolution {
  id: number;
  title: string;
  description?: string;
  team: string;
  team_id: string;
  responsible_id?: string;
  responsible_name?: string;
  quarter: number;
  status: ObjectiveStatus;
  key_results: KeyResultEvolution[];
  created_at: string;
  updated_at: string;
}

export interface EvolutionFilters {
  available_teams: FilterOption[];
  available_responsibles: FilterOption[];
  available_years: number[];
}

export interface EvolutionMetadata {
  total_objectives: number;
  total_key_results: number;
  generated_at: string;
  granularity: GranularityType;
  year: number;
}

export interface EvolutionResponse {
  objectives: ObjectiveEvolution[];
  periods?: string[];
  filters?: EvolutionFilters;
  metadata?: EvolutionMetadata;
}

// Entities para o endpoint de detalhes
export interface KeyResultDetail {
  id: number;
  title: string;
  current_value: number;
  target_value: number;
  progress: number;
  status: KeyResultStatus;
}

export interface HistoryItem {
  id: number;
  value: number;
  comment: string;
  created_at: string;
  created_by: string;
  type: 'manual' | 'automatic';
}

export interface NextMilestone {
  value: number;
  percentage: number;
  estimated_date: string;
}

export interface Insights {
  trend: 'improving' | 'declining' | 'stable';
  recommendation: string;
  next_milestone: NextMilestone;
}

export interface KeyResultPeriodDetail {
  key_result: KeyResultDetail;
  period: string;
  period_data: PeriodInfo;
  history: HistoryItem[];
  insights: Insights;
}
