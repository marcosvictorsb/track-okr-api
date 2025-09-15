import { ProfileEntity } from '@domains/api/profile/entity/profile.entity';
import {
  CreateProfileCriteria,
  DeleteProfileCriteria,
  FindProfileCriteria,
  IProfileRepository,
  ProfileRepositoryDependencies,
  UpdateProfileCriteria
} from '@domains/api/profile/interfaces';
import ProfileModel from '@domains/api/profile/model/profile.model';
import UserModel from '@domains/api/users/model/user.model';
import { ModelStatic, Op } from 'sequelize';

export class ProfileRepository implements IProfileRepository {
  protected model: ModelStatic<ProfileModel>;

  constructor(params: ProfileRepositoryDependencies) {
    this.model = params.model;
  }

  private getConditions(
    criteria: FindProfileCriteria
  ): Record<string, unknown> {
    const whereConditions: Record<string, unknown> = {};

    if (criteria.id) {
      whereConditions['id'] = criteria.id;
    }
    if (criteria.id_users && criteria.id_users.length > 0) {
      whereConditions['id_user'] = { [Op.in]: criteria.id_users };
    }

    if (criteria.id_user) {
      whereConditions['id_user'] = criteria.id_user;
    }

    if (criteria.photo_url) {
      whereConditions['photo_url'] = criteria.photo_url;
    }

    if (criteria.position) {
      whereConditions['position'] = criteria.position;
    }

    if (criteria.created_at) {
      whereConditions['created_at'] = criteria.created_at;
    }

    if (criteria.updated_at) {
      whereConditions['updated_at'] = criteria.updated_at;
    }

    if (criteria.deleted_at) {
      whereConditions['deleted_at'] = criteria.deleted_at;
    }

    return whereConditions;
  }

  private getIncludeOptions() {
    return [
      {
        model: UserModel,
        as: 'user',
        attributes: ['id', 'name', 'email'],
        required: false
      }
    ];
  }

  private mapToEntity(profile: ProfileModel): ProfileEntity {
    const data = profile.dataValues;

    // Adicionar informações do usuário se existirem
    const profileWithUser = profile as unknown as {
      user?: { name: string; email: string };
    };

    const entityData = {
      ...data,
      user_name: profileWithUser.user?.name,
      user_email: profileWithUser.user?.email
    };

    return new ProfileEntity(entityData);
  }

  public async create(criteria: CreateProfileCriteria): Promise<ProfileEntity> {
    console.log('ProfileRepository.create - Iniciando criação:', { criteria });

    const profile = await this.model.create({
      ...criteria,
      created_at: new Date()
    });

    console.log('ProfileRepository.create - Perfil criado:', {
      id: profile.id,
      id_user: profile.id_user,
      photo_url: profile.photo_url,
      position: profile.position
    });

    // Buscar o perfil criado com as associações
    const profileWithUser = await this.model.findByPk(profile.id, {
      include: this.getIncludeOptions()
    });

    if (!profileWithUser) {
      throw new Error('Erro ao recuperar perfil criado');
    }

    const result = this.mapToEntity(profileWithUser);

    console.log('ProfileRepository.create - Resultado final:', {
      id: result.id,
      id_user: result.id_user,
      photo_url: result.photo_url,
      position: result.position,
      user_name: result.user_name,
      user_email: result.user_email
    });

    return result;
  }

  public async find(
    criteria: FindProfileCriteria
  ): Promise<ProfileEntity | undefined> {
    const whereConditions = this.getConditions(criteria);

    const profile = await this.model.findOne({
      where: whereConditions,
      include: this.getIncludeOptions()
    });

    if (!profile) return undefined;

    return this.mapToEntity(profile);
  }

  public async findAll(
    criteria: FindProfileCriteria
  ): Promise<ProfileEntity[]> {
    const whereConditions = this.getConditions(criteria);

    const profiles = await this.model.findAll({
      where: whereConditions,
      include: this.getIncludeOptions(),
      limit: criteria.limite || undefined,
      order: [['created_at', 'DESC']]
    });

    return profiles.map((profile) => this.mapToEntity(profile));
  }

  public async findByUserId(
    id_user: number
  ): Promise<ProfileEntity | undefined> {
    return this.find({ id_user });
  }

  public async update(
    data: Partial<UpdateProfileCriteria>,
    criteria: UpdateProfileCriteria
  ): Promise<boolean> {
    const [affectedRows] = await this.model.update(data, {
      where: this.getConditions(criteria)
    });

    const success = affectedRows > 0;

    return success;
  }

  public async delete(criteria: DeleteProfileCriteria): Promise<boolean> {
    const affectedRows = await this.model.destroy({
      where: { id: criteria.id }
    });

    return affectedRows > 0;
  }

  public async upsert(criteria: CreateProfileCriteria): Promise<ProfileEntity> {
    // Verificar se já existe perfil para o usuário
    const existingProfile = await this.findByUserId(criteria.id_user);

    if (existingProfile) {
      // Atualizar perfil existente
      const updateData: Record<string, unknown> = {};

      if (criteria.photo_url !== undefined) {
        updateData.photo_url = criteria.photo_url;
      }

      if (criteria.position !== undefined) {
        updateData.position = criteria.position;
      }

      const success = await this.update(
        updateData as Partial<UpdateProfileCriteria>,
        { id_user: criteria.id_user }
      );

      if (!success) {
        throw new Error('Falha ao atualizar perfil existente');
      }

      return (await this.findByUserId(criteria.id_user))!;
    } else {
      // Criar novo perfil
      return await this.create(criteria);
    }
  }
}
