export class UserTeamEntity {
  public id?: number;
  public id_user: number;
  public id_team: number;
  public role_in_team: string;
  public created_at?: Date;
  public updated_at?: Date;
  public deleted_at?: Date;

  constructor(data: {
    id?: number;
    id_user: number;
    id_team: number;
    role_in_team: string;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
  }) {
    this.id = data.id;
    this.id_user = data.id_user;
    this.id_team = data.id_team;
    this.role_in_team = data.role_in_team;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.deleted_at = data.deleted_at;
  }

  // Método para verificar se o usuário está ativo no time
  public isActiveInTeam(): boolean {
    return this.deleted_at === null || this.deleted_at === undefined;
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
      is_active: this.isActiveInTeam(),
      is_leader: this.isTeamLeader()
    };
  }
}
