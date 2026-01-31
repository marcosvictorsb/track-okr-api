export class ProfileEntity {
  public readonly id?: number;
  public readonly id_user: number;
  public readonly photo_url?: string | null;
  public readonly position?: string | null;
  public readonly created_at?: Date;
  public readonly updated_at?: Date | null;
  public readonly deleted_at?: Date | null;

  public readonly user_name?: string;
  public readonly user_email?: string;

  constructor(params: {
    id?: number;
    id_user: number;
    photo_url?: string | null;
    position?: string | null;
    created_at?: Date;
    updated_at?: Date | null;
    deleted_at?: Date | null;
    user_name?: string;
    user_email?: string;
  }) {
    this.id = params.id;
    this.id_user = params.id_user;
    this.photo_url = params.photo_url;
    this.position = params.position;
    this.created_at = params.created_at;
    this.updated_at = params.updated_at;
    this.deleted_at = params.deleted_at;
    this.user_name = params.user_name;
    this.user_email = params.user_email;
  }

  public hasPhoto(): boolean {
    return !!(this.photo_url && this.photo_url.trim().length > 0);
  }

  public hasPosition(): boolean {
    return !!(this.position && this.position.trim().length > 0);
  }

  public getDisplayPosition(): string {
    return this.position || 'Cargo não informado';
  }

  public getDisplayName(): string {
    return this.user_name || 'Usuário não encontrado';
  }

  public isComplete(): boolean {
    return this.hasPhoto() && this.hasPosition();
  }

  public getCompletionPercentage(): number {
    let completed = 0;
    const total = 2;

    if (this.hasPhoto()) completed++;
    if (this.hasPosition()) completed++;

    return Math.round((completed / total) * 100);
  }

  public toJSON() {
    return {
      id: this.id,
      id_user: this.id_user,
      photo_url: this.photo_url,
      position: this.position,
      user_name: this.user_name,
      user_email: this.user_email,
      has_photo: this.hasPhoto(),
      has_position: this.hasPosition(),
      display_position: this.getDisplayPosition(),
      is_complete: this.isComplete(),
      completion_percentage: this.getCompletionPercentage(),
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at
    };
  }
}
