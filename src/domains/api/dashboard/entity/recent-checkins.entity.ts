export interface RecentCheckInData {
  id: number;
  user: string;
  team: string;
  keyResult: string;
  oldValue: number;
  newValue: number;
  date: string;
  avatar: string;
}

export class RecentCheckInsEntity {
  public checkIns: RecentCheckInData[];

  constructor(data: { checkIns: RecentCheckInData[] }) {
    this.checkIns = data.checkIns;
  }

  public static formatCheckIn(
    update: {
      id?: number;
      id_result_key: number;
      previous_value: number;
      new_value: number;
      created_at?: Date;
      comment?: string;
    },
    user: {
      id: number;
      name: string;
      avatar?: string;
    },
    team: {
      name: string;
    },
    resultKey: {
      name: string;
    },
    index: number
  ): RecentCheckInData {
    return {
      id: update.id || index + 1,
      user: user.name || `Usuário ${index + 1}`,
      team: team.name || 'Não informado',
      keyResult: resultKey.name || `Resultado-chave ${index + 1}`,
      oldValue: update.previous_value || 0,
      newValue: update.new_value || 0,
      date: update.created_at?.toISOString() || new Date().toISOString(),
      avatar: user.avatar || `/demo/images/avatar/user${index + 1}.png`
    };
  }
}
