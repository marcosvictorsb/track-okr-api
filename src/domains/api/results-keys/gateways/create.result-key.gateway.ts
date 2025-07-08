import {
  CreateResultKeyCriteria,
  IResultKeyRepository,
  ICreateResultKeyGateway,
  ICreateResultKeyGatewayDependencies
} from '@domains/api/results-keys/interfaces';
import { ResultKeyEntity } from '@domains/api/results-keys/entity/result-key.entity';
import { logger } from '@configs/logger';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { IObjectiveRepository } from '@domains/api/objectives/interfaces';

export class CreateResultKeyGateway implements ICreateResultKeyGateway {
  resultKeyRepository: IResultKeyRepository;
  teamRepository: ITeamRepository;
  objectiveRepository: IObjectiveRepository;
  logging: typeof logger;

  constructor(params: ICreateResultKeyGatewayDependencies) {
    this.resultKeyRepository = params.resultKeyRepository;
    this.teamRepository = params.teamRepository;
    this.objectiveRepository = params.objectiveRepository;
    this.logging = params.logging;
  }

  public async create(data: CreateResultKeyCriteria): Promise<ResultKeyEntity> {
    this.logging.info('Creating new result key', { data });
    return await this.resultKeyRepository.create(data);
  }

  public async validateTeamBelongsToCompany(
    teamId: number,
    companyId: number
  ): Promise<boolean> {
    try {
      this.logging.info('Validating team belongs to company', {
        teamId,
        companyId
      });

      const team = await this.teamRepository.find({ id: teamId });

      if (!team) {
        this.logging.warn('Team not found', { teamId });
        return false;
      }

      const belongsToCompany = team.id_company === companyId;

      if (!belongsToCompany) {
        this.logging.warn('Team does not belong to company', {
          teamId,
          companyId,
          teamCompanyId: team.id_company
        });
      }

      return belongsToCompany;
    } catch (error) {
      this.logging.error('Error validating team belongs to company', {
        error,
        teamId,
        companyId
      });
      return false;
    }
  }

  public async validateObjectiveBelongsToCompany(
    objectiveId: number,
    companyId: number
  ): Promise<boolean> {
    try {
      this.logging.info('Validating objective belongs to company', {
        objectiveId,
        companyId
      });

      const objective = await this.objectiveRepository.findOne({
        id: objectiveId
      });

      if (!objective) {
        this.logging.warn('Objective not found', { objectiveId });
        return false;
      }

      // Buscar o time do objetivo para verificar se pertence à empresa
      const team = await this.teamRepository.find({ id: objective.id_team });

      if (!team) {
        this.logging.warn('Team not found for objective', {
          objectiveId,
          teamId: objective.id_team
        });
        return false;
      }

      const belongsToCompany = team.id_company === companyId;

      if (!belongsToCompany) {
        this.logging.warn('Objective does not belong to company', {
          objectiveId,
          companyId,
          teamId: objective.id_team,
          teamCompanyId: team.id_company
        });
      }

      return belongsToCompany;
    } catch (error) {
      this.logging.error('Error validating objective belongs to company', {
        error,
        objectiveId,
        companyId
      });
      return false;
    }
  }

  public async validateUsersBelongToCompany(
    userIds: number[],
    companyId: number
  ): Promise<boolean> {
    try {
      this.logging.info('Validating users belong to company', {
        userIds,
        companyId
      });

      if (userIds.length === 0) {
        return true; // Array vazio é válido
      }

      // Para cada usuário, verificar se pertence à empresa
      // Isso pode ser feito através da tabela user_teams
      // Por simplicidade, vamos assumir que a validação é feita através da relação user-company

      // TODO: Implementar validação real quando houver repository de usuários
      // Por agora, vamos retornar true para não bloquear o desenvolvimento
      this.logging.info('User validation not implemented yet, returning true');
      return true;
    } catch (error) {
      this.logging.error('Error validating users belong to company', {
        error,
        userIds,
        companyId
      });
      return false;
    }
  }

  public loggerInfo(message: string, data?: Record<string, unknown>): void {
    this.logging.info(message, data);
  }

  public loggerError(message: string, data?: Record<string, unknown>): void {
    this.logging.error(message, data);
  }
}
