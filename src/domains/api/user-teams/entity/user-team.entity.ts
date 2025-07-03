export class UserTeamEntity {
  public id?: number;
  public id_user: number;
  public id_team: number;
  public role_in_team: string;
  public joined_at: Date;
  public left_at?: Date;
  public created_at?: Date;
  public updated_at?: Date;

  constructor(data: {
    id?: number;
    id_user: number;
    id_team: number;
    role_in_team: string;
    joined_at: Date;
    left_at?: Date;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = data.id;
    this.id_user = data.id_user;
    this.id_team = data.id_team;
    this.role_in_team = data.role_in_team;
    this.joined_at = data.joined_at;
    this.left_at = data.left_at;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Método para verificar se o usuário está ativo no time
  public isActiveInTeam(): boolean {
    return this.left_at === null || this.left_at === undefined;
  }

  // Método para verificar se o usuário é líder do time
  public isTeamLeader(): boolean {
    return this.role_in_team === 'leader';
  }

  // Método para obter dados para serialização (sem campos sensíveis)
  public toJSON() {
    return {
      id: this.id,
      id_user: this.id_user,
      id_team: this.id_team,
      role_in_team: this.role_in_team,
      joined_at: this.joined_at,
      left_at: this.left_at,
      is_active: this.isActiveInTeam(),
      is_leader: this.isTeamLeader()
    };
  }
}
