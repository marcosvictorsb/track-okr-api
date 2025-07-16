export interface ITeamPerformanceEntity {
  teams: TeamPerformanceItem[];
}

export interface TeamPerformanceItem {
  id?: string;
  name: string;
  progress: number;
  objectives: number;
  keyResults: number;
  status: TeamStatus;
  trend: TrendDirection;
  members?: number;
  lastUpdate?: string;
}

export type TeamStatus = 'excellent' | 'good' | 'warning' | 'danger';
export type TrendDirection = 'up' | 'down' | 'stable';

export class TeamPerformanceEntity implements ITeamPerformanceEntity {
  teams: TeamPerformanceItem[];

  constructor(params: { teams: TeamPerformanceItem[] }) {
    this.teams = params.teams;
  }

  static calculateTeamStatus(progress: number): TeamStatus {
    if (progress >= 85) return 'excellent';
    if (progress >= 70) return 'good';
    if (progress >= 50) return 'warning';
    return 'danger';
  }

  static calculateTrend(current: number, previous: number): TrendDirection {
    const diff = current - previous;
    if (diff > 2) return 'up';
    if (diff < -2) return 'down';
    return 'stable';
  }
}
