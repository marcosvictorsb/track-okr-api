import { MixFiltersEvolution } from '@adapters/gateways/api/evolution/filters.evolution.gateway';
import { logger } from '@configs/logger';
import { IObjectiveRepository } from '@domains/api/objectives/interfaces';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { IUserRepository } from '@domains/api/users/interfaces';
import {
  IFiltersEvolutionGateway,
  IFiltersEvolutionGatewayDependencies
} from '../interfaces/filters.evolution.interface';

export class FiltersEvolutionGateway
  extends MixFiltersEvolution
  implements IFiltersEvolutionGateway
{
  objectiveRepository: IObjectiveRepository;
  teamRepository: ITeamRepository;
  userRepository: IUserRepository;
  logging: typeof logger;

  constructor(params: IFiltersEvolutionGatewayDependencies) {
    super(params);
    this.objectiveRepository = params.objectiveRepository;
    this.teamRepository = params.teamRepository;
    this.userRepository = params.userRepository;
    this.logging = params.logging;
  }

  public async getYearByObjectives(id_company: number): Promise<number[]> {
    this.logging.info('Encontrar objetivos para a empresa', {
      id_company
    });

    const years = await this.objectiveRepository.findYearsByCompany(id_company);

    this.logging.info('Anos encontrados com sucesso', {
      id_company,
      years
    });

    return years;
  }

  public async getTeamsByCompany(
    id_company: number
  ): Promise<{ label: string; value: string }[]> {
    this.logging.info('Encontrar times para a empresa', {
      id_company
    });

    const teams = await this.teamRepository.findAll({ id_company });

    this.logging.info('Times encontrados com sucesso', {
      id_company,
      teams
    });

    if (teams && teams.length > 0) {
      return teams.map((team) => ({
        value: (team.id as number).toString(),
        label: team.name
      }));
    }

    return [{ value: '0', label: '' }];
  }

  public async findResponsiblesByCompany(
    id_company: number
  ): Promise<{ label: string; value: string }[]> {
    this.logging.info('Encontrar responsáveis para a empresa', {
      id_company
    });

    const responsibles = await this.userRepository.findAll({
      id_company
    });

    this.logging.info('Responsáveis encontrados com sucesso', {
      id_company,
      responsibles
    });

    if (responsibles && responsibles.length > 0) {
      return responsibles.map((responsible) => ({
        value: (responsible.id as number).toString(),
        label: responsible.name
      }));
    }

    return [{ value: '0', label: '' }];
  }
}
