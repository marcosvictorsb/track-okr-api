import ResultKeyModel from '@domains/api/results-keys/model/result-key.model';
import { ResultKeyEntity } from '@domains/api/results-keys/entity/result-key.entity';
import { ModelStatic, Op } from 'sequelize';
import {
  CreateResultKeyCriteria,
  DeleteResultKeyCriteria,
  FindResultKeyCriteria,
  IResultKeyRepository,
  UpdateResultKeyCriteria,
  ResultKeyRepositoryDependencies
} from '@domains/api/results-keys/interfaces';
import TeamModel from '@domains/api/teams/model/team.model';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';

export class ResultKeyRepository implements IResultKeyRepository {
  protected model: ModelStatic<ResultKeyModel>;

  constructor(params: ResultKeyRepositoryDependencies) {
    this.model = params.model;
  }

  private getConditions(
    criteria: FindResultKeyCriteria
  ): Record<string, unknown> {
    const whereConditions: Record<string, unknown> = {};

    if (criteria.id) {
      whereConditions['id'] = criteria.id;
    }

    if (criteria.name) {
      whereConditions['name'] = {
        [Op.iLike]: `%${criteria.name}%`
      };
    }

    if (criteria.responsible_team_id) {
      whereConditions['responsible_team_id'] = criteria.responsible_team_id;
    }

    if (criteria.id_okr) {
      whereConditions['id_okr'] = criteria.id_okr;
    }

    if (criteria.ids_okr && criteria.ids_okr.length > 0) {
      whereConditions['id_okr'] = {
        [Op.in]: criteria.ids_okr
      };
    }

    if (criteria.status) {
      whereConditions['status'] = criteria.status;
    }

    if (criteria.responsible_users && criteria.responsible_users.length > 0) {
      whereConditions['responsible_users'] = {
        [Op.contains]: criteria.responsible_users
      };
    }

    return whereConditions;
  }

  private getIncludeOptions() {
    return [
      {
        model: TeamModel,
        as: 'responsibleTeam',
        attributes: ['id', 'name'],
        required: false
      },
      {
        model: ObjectiveModel,
        as: 'objective',
        attributes: ['id', 'title'],
        required: false
      }
    ];
  }

  private mapToEntity(resultKey: ResultKeyModel): ResultKeyEntity {
    const data = resultKey.dataValues;

    // Adicionar informações relacionadas se existirem
    const resultKeyWithIncludes = resultKey as unknown as {
      responsibleTeam?: { name: string };
      objective?: { title: string };
    };

    const entityData = {
      ...data,
      team_name: resultKeyWithIncludes.responsibleTeam?.name,
      objective_title: resultKeyWithIncludes.objective?.title
    };

    return new ResultKeyEntity({
      id: entityData.id,
      name: entityData.name,
      initial_value: entityData.initial_value,
      target_value: entityData.target_value,
      current_value: entityData.current_value,
      unit: entityData.unit,
      status: entityData.status,
      responsible_users: entityData.responsible_users || [],
      responsible_team_id: entityData.responsible_team_id,
      id_okr: entityData.id_okr,
      team_name: entityData.team_name,
      objective_title: entityData.objective_title
    });
  }

  public async create(
    criteria: CreateResultKeyCriteria
  ): Promise<ResultKeyEntity> {
    const resultKeyData = {
      ...criteria,
      current_value: criteria.current_value || 0,
      status: criteria.status || ('active' as const)
    };

    const resultKey = await this.model.create(resultKeyData);
    return this.mapToEntity(resultKey);
  }

  public async findOne(
    criteria: FindResultKeyCriteria
  ): Promise<ResultKeyEntity | undefined> {
    const whereConditions = this.getConditions(criteria);

    const resultKey = await this.model.findOne({
      where: whereConditions,
      include: this.getIncludeOptions()
    });

    if (!resultKey) {
      return undefined;
    }

    return this.mapToEntity(resultKey);
  }

  public async findMany(
    criteria: FindResultKeyCriteria
  ): Promise<ResultKeyEntity[]> {
    const whereConditions = this.getConditions(criteria);

    const resultKeys = await this.model.findAll({
      where: whereConditions,
      include: this.getIncludeOptions(),
      order: [['created_at', 'ASC']]
    });

    return resultKeys.map((resultKey) => this.mapToEntity(resultKey));
  }

  public async update(
    criteria: FindResultKeyCriteria,
    data: UpdateResultKeyCriteria
  ): Promise<ResultKeyEntity | null> {
    const whereConditions = this.getConditions(criteria);

    const [affectedRows] = await this.model.update(data, {
      where: whereConditions
    });

    if (affectedRows === 0) {
      return null;
    }

    const updatedResultKey = await this.model.findOne({
      where: whereConditions,
      include: this.getIncludeOptions()
    });

    if (!updatedResultKey) {
      return null;
    }

    return this.mapToEntity(updatedResultKey);
  }

  public async delete(criteria: DeleteResultKeyCriteria): Promise<boolean> {
    const affectedRows = await this.model.destroy({
      where: { id: criteria.id }
    });

    return affectedRows > 0;
  }

  public async findByObjectiveId(
    objectiveId: number
  ): Promise<ResultKeyEntity[]> {
    return this.findMany({ id_okr: objectiveId });
  }

  public async findByObjectiveIds(
    objectiveIds: number[]
  ): Promise<ResultKeyEntity[]> {
    return this.findMany({ ids_okr: objectiveIds });
  }

  public async findByTeamId(teamId: number): Promise<ResultKeyEntity[]> {
    return this.findMany({ responsible_team_id: teamId });
  }

  public async findByResponsibleUser(
    userId: number
  ): Promise<ResultKeyEntity[]> {
    const resultKeys = await this.model.findAll({
      where: {
        responsible_users: {
          [Op.contains]: [userId]
        }
      },
      include: this.getIncludeOptions(),
      order: [['created_at', 'DESC']]
    });

    return resultKeys.map((resultKey) => this.mapToEntity(resultKey));
  }

  public async updateProgress(
    id: number,
    currentValue: number
  ): Promise<ResultKeyEntity | null> {
    const resultKey = await this.model.findByPk(id);

    if (!resultKey) {
      return null;
    }

    // Atualizar o valor atual
    resultKey.current_value = currentValue;

    // Verificar se deve marcar como completo
    if (
      currentValue >= resultKey.target_value &&
      resultKey.status === 'active'
    ) {
      resultKey.status = 'completed';
    }

    // Salvar com validações desabilitadas para evitar problemas com responsible_users/responsible_team_id
    await resultKey.save({ validate: false });

    return this.mapToEntity(resultKey);
  }

  public async countKeyResultsByObjective(
    criteria: FindResultKeyCriteria
  ): Promise<number> {
    const whereConditions = this.getConditions(criteria);

    return this.model.count({
      where: whereConditions
    });
  }
}
