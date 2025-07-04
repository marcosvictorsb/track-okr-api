import {
  IObjectiveGateway,
  CreateObjectiveCriteria,
  UpdateObjectiveCriteria,
  IObjectiveRepository
} from '@domains/api/objectives/interfaces';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';

export class ObjectiveGateway implements IObjectiveGateway {
  constructor(private readonly objectiveRepository: IObjectiveRepository) {}

  public async create(data: CreateObjectiveCriteria): Promise<ObjectiveEntity> {
    return await this.objectiveRepository.create(data);
  }

  public async findById(id: number): Promise<ObjectiveEntity | null> {
    return await this.objectiveRepository.findOne({ id });
  }

  public async findByTeam(id_team: number): Promise<ObjectiveEntity[]> {
    return await this.objectiveRepository.findMany({ id_team });
  }

  public async findByQuarter(
    quarter: number,
    year: number
  ): Promise<ObjectiveEntity[]> {
    return await this.objectiveRepository.findMany({ quarter, year });
  }

  public async update(
    id: number,
    data: UpdateObjectiveCriteria
  ): Promise<ObjectiveEntity | null> {
    return await this.objectiveRepository.update({ id }, data);
  }

  public async delete(id: number): Promise<boolean> {
    return await this.objectiveRepository.delete({ id });
  }
}
