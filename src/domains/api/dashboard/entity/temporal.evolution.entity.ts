export interface QuarterData {
  name: string;
  data: number[];
  color: string;
}

export interface ComparisonData {
  improvement: number;
  bestMonth: string;
  worstMonth: string;
}

export interface ITemporalEvolutionEntity {
  period: string;
  labels: string[];
  currentQuarter: QuarterData;
  previousQuarter: QuarterData;
  comparison: ComparisonData;
}

export class TemporalEvolutionEntity implements ITemporalEvolutionEntity {
  readonly period: string;
  readonly labels: string[];
  readonly currentQuarter: QuarterData;
  readonly previousQuarter: QuarterData;
  readonly comparison: ComparisonData;

  constructor(data: ITemporalEvolutionEntity) {
    this.period = data.period;
    this.labels = data.labels;
    this.currentQuarter = data.currentQuarter;
    this.previousQuarter = data.previousQuarter;
    this.comparison = data.comparison;
  }

  public static getMonthLabels(): string[] {
    return [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
  }

  public static calculateComparison(
    currentData: number[],
    previousData: number[],
    labels: string[]
  ): ComparisonData {
    const currentAvg =
      currentData.reduce((sum, val) => sum + val, 0) / currentData.length;
    const previousAvg =
      previousData.reduce((sum, val) => sum + val, 0) / previousData.length;

    const improvement = Number(
      (((currentAvg - previousAvg) / previousAvg) * 100).toFixed(2)
    );

    // Encontrar melhor e pior mês do trimestre atual
    const maxIndex = currentData.indexOf(Math.max(...currentData));
    const minIndex = currentData.indexOf(Math.min(...currentData));

    return {
      improvement,
      bestMonth: labels[maxIndex],
      worstMonth: labels[minIndex]
    };
  }

  public static calculateMonthlyProgress(
    checkins: Array<{
      id_result_key: number;
      new_value: number;
      target_value: number;
      created_at: Date;
    }>,
    year: number,
    quarter: number
  ): number[] {
    const monthlyProgress = new Array(12).fill(0);
    const monthlyCount = new Array(12).fill(0);

    // Determinar os meses do trimestre
    const quarterMonths = TemporalEvolutionEntity.getQuarterMonths(quarter);

    checkins.forEach((update) => {
      const updateDate = new Date(update.created_at);
      if (updateDate.getFullYear() === year) {
        const month = updateDate.getMonth(); // 0-11

        if (quarterMonths.includes(month)) {
          const progress = (update.new_value / update.target_value) * 100;
          monthlyProgress[month] += Math.min(progress, 100); // Cap at 100%
          monthlyCount[month] += 1;
        }
      }
    });

    // Calcular médias por mês
    return monthlyProgress.map((total, index) =>
      monthlyCount[index] > 0 ? Math.round(total / monthlyCount[index]) : 0
    );
  }

  private static getQuarterMonths(quarter: number): number[] {
    switch (quarter) {
      case 1:
        return [0, 1, 2]; // Jan, Feb, Mar
      case 2:
        return [3, 4, 5]; // Apr, May, Jun
      case 3:
        return [6, 7, 8]; // Jul, Aug, Sep
      case 4:
        return [9, 10, 11]; // Oct, Nov, Dec
      default:
        return [];
    }
  }

  public toJSON(): ITemporalEvolutionEntity {
    return {
      period: this.period,
      labels: this.labels,
      currentQuarter: this.currentQuarter,
      previousQuarter: this.previousQuarter,
      comparison: this.comparison
    };
  }
}
