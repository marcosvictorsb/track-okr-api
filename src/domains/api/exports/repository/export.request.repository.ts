/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExportRequestEntity } from '@domains/api/exports/entity/export.request.entity';
import {
  CreateExportRequestCriteria,
  DeleteExportRequestCriteria,
  ExportRequestRepositoryDependencies,
  FindExportRequestCriteria,
  IExportRequestRepository,
  UpdateExportRequestCriteria
} from '@domains/api/exports/interfaces';
import ExportRequestModel, {
  ExportRequestModelAttributes
} from '@domains/api/exports/model/export.request.model';
import { ModelStatic, Op } from 'sequelize';

export class ExportRequestRepository implements IExportRequestRepository {
  protected model: ModelStatic<ExportRequestModel>;

  constructor(params: ExportRequestRepositoryDependencies) {
    this.model = params.model;
  }

  private getConditions(
    criteria: FindExportRequestCriteria
  ): Record<string, any> {
    const whereConditions: Record<string, any> = {};

    if (criteria.id) {
      whereConditions['id'] = criteria.id;
    }

    if (criteria.id_user) {
      whereConditions['id_user'] = criteria.id_user;
    }

    if (criteria.id_company) {
      whereConditions['id_company'] = criteria.id_company;
    }

    if (criteria.email) {
      whereConditions['email'] = criteria.email;
    }

    if (criteria.status) {
      whereConditions['status'] = criteria.status;
    }

    if (criteria.statuses && criteria.statuses.length > 0) {
      whereConditions['status'] = { [Op.in]: criteria.statuses };
    }

    return whereConditions;
  }

  public async create(
    criteria: CreateExportRequestCriteria
  ): Promise<ExportRequestEntity> {
    const createData = {
      ...criteria,
      requested_at: criteria.requested_at || new Date()
    };
    const exportRequest = await this.model.create(createData);
    return new ExportRequestEntity(exportRequest.dataValues);
  }

  public async find(
    criteria: FindExportRequestCriteria
  ): Promise<ExportRequestEntity | undefined> {
    const exportRequest = await this.model.findOne({
      where: this.getConditions(criteria),
      raw: true
    });

    if (!exportRequest) return undefined;

    return new ExportRequestEntity(exportRequest);
  }

  public async findAll(
    criteria: FindExportRequestCriteria
  ): Promise<ExportRequestEntity[]> {
    const exportRequests = await this.model.findAll({
      where: this.getConditions(criteria),
      raw: true
    });

    if (!exportRequests || exportRequests.length === 0) return [];

    return exportRequests.map(
      (exportRequest: ExportRequestModelAttributes) =>
        new ExportRequestEntity(exportRequest)
    );
  }

  public async update(
    data: Partial<UpdateExportRequestCriteria>,
    criteria: UpdateExportRequestCriteria
  ): Promise<boolean> {
    const [affectedRows] = await this.model.update(data, {
      where: { id: criteria.id }
    });
    if (affectedRows === 0) return false;
    return true;
  }

  public async delete(criteria: DeleteExportRequestCriteria): Promise<boolean> {
    const affectedRows = await this.model.destroy({
      where: { id: criteria.id }
    });
    return affectedRows > 0;
  }

  public async countRequests(
    criteria: FindExportRequestCriteria
  ): Promise<number> {
    const count = await this.model.count({
      where: this.getConditions(criteria)
    });
    return count;
  }
}
