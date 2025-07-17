export interface TrendsComparison {
  lastQuarter: number;
  change: number;
}

export interface StatisticItem {
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  total?: number;
}

export interface OverviewStatistics {
  generalProgress: StatisticItem;
  completedOkrs: StatisticItem;
  engagement: StatisticItem;
  averageRisk: StatisticItem;
  averageCheckIns: number;
  weeklyProgress: number;
}

export interface IOverviewEntity {
  quarter: string;
  year: number;
  progress: number;
  totalObjectives: number;
  onTrack: number;
  atRisk: number;
  delayed: number;
  completedKeyResults: number;
  totalKeyResults: number;
  avgTeamPerformance: number;
  trendsComparison: TrendsComparison;
  statistics: OverviewStatistics;
}

export class OverviewEntity implements IOverviewEntity {
  readonly quarter: string;
  readonly year: number;
  readonly progress: number;
  readonly totalObjectives: number;
  readonly onTrack: number;
  readonly atRisk: number;
  readonly delayed: number;
  readonly completedKeyResults: number;
  readonly totalKeyResults: number;
  readonly avgTeamPerformance: number;
  readonly trendsComparison: TrendsComparison;
  readonly statistics: OverviewStatistics;

  constructor(params: IOverviewEntity) {
    this.quarter = params.quarter;
    this.year = params.year;
    this.progress = params.progress;
    this.totalObjectives = params.totalObjectives;
    this.onTrack = params.onTrack;
    this.atRisk = params.atRisk;
    this.delayed = params.delayed;
    this.completedKeyResults = params.completedKeyResults;
    this.totalKeyResults = params.totalKeyResults;
    this.avgTeamPerformance = params.avgTeamPerformance;
    this.trendsComparison = params.trendsComparison;
    this.statistics = params.statistics;
  }

  static calculateTrend(
    current: number,
    previous: number
  ): 'up' | 'down' | 'stable' {
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'stable';
  }

  static calculateChange(current: number, previous: number): number {
    if (previous === 0) return current;
    return Math.round(((current - previous) / previous) * 100);
  }

  static calculateProgress(current: number, target: number): number {
    if (target === 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  }
}
