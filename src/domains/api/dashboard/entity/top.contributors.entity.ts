export interface ITopContributorsEntity {
  contributors: ContributorItem[];
  pagination: PaginationInfo;
}

export interface ContributorItem {
  id: number;
  name: string;
  email: string;
  avatar: string;
  team: {
    id: string;
    name: string;
  };
  contributions: number;
  impactScore: number;
  lastActivity: string;
  keyResultsUpdated: number;
  checkInsThisWeek: number;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class TopContributorsEntity implements ITopContributorsEntity {
  contributors: ContributorItem[];
  pagination: PaginationInfo;

  constructor(params: {
    contributors: ContributorItem[];
    pagination: PaginationInfo;
  }) {
    this.contributors = params.contributors;
    this.pagination = params.pagination;
  }

  static calculateImpactScore(
    totalProgress: number,
    keyResultsCount: number,
    contributions: number
  ): number {
    // Fórmula para calcular impact score baseado em progresso, quantidade de KRs e contribuições
    const progressWeight = 0.4;
    const keyResultsWeight = 0.3;
    const contributionsWeight = 0.3;

    const normalizedProgress = Math.min(totalProgress / 100, 1);
    const normalizedKeyResults = Math.min(keyResultsCount / 10, 1);
    const normalizedContributions = Math.min(contributions / 50, 1);

    const score =
      (normalizedProgress * progressWeight +
        normalizedKeyResults * keyResultsWeight +
        normalizedContributions * contributionsWeight) *
      100;

    return Math.round(score);
  }

  static calculateContributions(
    keyResultsUpdated: number,
    checkIns: number
  ): number {
    // Cada key result atualizada vale 2 pontos, cada check-in vale 1 ponto
    return keyResultsUpdated * 2 + checkIns;
  }
}
