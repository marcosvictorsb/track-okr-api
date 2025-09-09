import { HttpResponse } from '@protocols/http';
import {
  GetObjectiveInteractorDependencies,
  InputGetObjective,
  IGetObjectiveGateway
} from '@domains/api/objectives/interfaces/get.objective.interface';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import { ObjectiveEntity } from '../entity/objective.entity';

export class GetObjectiveInteractor {
  protected gateway: IGetObjectiveGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: GetObjectiveInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  public async execute(input: InputGetObjective): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Iniciando a busca dos objetivos', {
        requestTxt: JSON.stringify(input)
      });

      const { id, id_team, quarter, year, id_company, id_user, status } = input;

      // Validar usuário e empresa
      const validation = await this.userCompanyValidator.execute({
        id_user,
        id_company
      });

      if (!validation.isValid) {
        this.gateway.loggerInfo('Usuário ou empresa inválidos', {
          id_user,
          id_company
        });
        return this.presenter.badRequest('Usuário ou empresa inválidos');
      }

      let objectives;

      if (id) {
        const objective = await this.gateway.findById(id);
        objectives = objective ? [objective] : [];
      } else if (id_team) {
        objectives = await this.gateway.findByTeam(id_team);
      } else if (quarter && year) {
        this.gateway.loggerInfo('Buscando objetivos por trimestre e ano', {
          quarter,
          year
        });
        objectives = await this.gateway.findByQuarter(
          quarter,
          year,
          id_company,
          status
        );
      } else {
        // Se não há critérios específicos, retornar erro
        return this.presenter.badRequest(
          'At least one search criteria must be provided (id, id_team, or quarter+year)'
        );
      }

      if (!objectives || objectives.length === 0) {
        this.gateway.loggerInfo('Nenhum objetivo encontrado');
        return this.presenter.ok([]);
      }

      const idsTeam = objectives.map(
        (objective: ObjectiveEntity) => objective.id_team
      );
      const teams = await this.gateway.findTeam({ ids: idsTeam });

      objectives.forEach((objective: ObjectiveEntity) => {
        const team = teams.find((team) => team.id === objective.id_team);
        if (team) {
          objective.team_name = team.name;
        }
      });

      // Buscar resultados-chaves para cada objetivo
      const objectiveIds = objectives
        .map((objective: ObjectiveEntity) => objective.id)
        .filter((id): id is number => id !== undefined);

      if (objectiveIds.length > 0) {
        const resultKeys =
          await this.gateway.findResultKeysByObjectiveIds(objectiveIds);

        // Agrupar result-keys por objetivo
        objectives.forEach((objective: ObjectiveEntity) => {
          objective.result_keys = resultKeys.filter(
            (resultKey) => resultKey.id_okr === objective.id
          );
        });
      }

      // pegar os ids dos responsible_users e buscar os nomes do usuario
      const responsibleUserIds = objectives
        .flatMap(
          (objective: ObjectiveEntity) =>
            objective.result_keys?.flatMap((rk) => rk.responsible_users) || []
        )
        .filter(
          (id): id is number => typeof id === 'number' && id !== undefined
        );

      if (responsibleUserIds.length > 0) {
        const responsibleUsers = await this.gateway.findUsers({
          ids: responsibleUserIds
        });

        const profileDetails = await this.gateway.findProfilesByUserIds({
          ids: responsibleUserIds
        });

        // Criar um Map para lookup O(1) dos profiles
        const profileMap = new Map(
          profileDetails.map((profile) => [
            profile.id_user,
            {
              photo_url: profile.photo_url,
              position: profile.position
            }
          ])
        );

        // Mapear os usuários responsáveis para cada result-key
        objectives.forEach((objective: ObjectiveEntity) => {
          objective.result_keys?.forEach((resultKey) => {
            const responsibleUsersArray = this.parseResponsibleUsers(
              resultKey.responsible_users
            );

            resultKey.responsible_users_details = responsibleUsersArray.map(
              (id: number) => {
                const user = responsibleUsers.find((u) => u.id === id);
                const profile = profileMap.get(id);
                return user
                  ? {
                      id: user.id,
                      name: user.name,
                      photo_url: profile?.photo_url || null,
                      position: profile?.position || null
                    }
                  : {
                      id,
                      name: 'Unknown',
                      photo_url: null,
                      position: null
                    };
              }
            );
          });
        });
      }

      this.gateway.loggerInfo('Objetivos encontrados com sucesso');
      return this.presenter.ok(objectives);
    } catch (error) {
      this.gateway.loggerError('Erro ao buscar objetivos', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        id_company: input.id_company
      });
      return this.presenter.serverError('Erro ao buscar objetivos');
    }
  }

  // Adicionar este método privado na classe
  private parseResponsibleUsers(responsibleUsers: any): number[] {
    if (!responsibleUsers) {
      return [];
    }

    if (Array.isArray(responsibleUsers)) {
      return responsibleUsers.filter(
        (id) => typeof id === 'number' && !isNaN(id)
      );
    }

    if (typeof responsibleUsers === 'string') {
      try {
        const parsed = JSON.parse(responsibleUsers);
        return Array.isArray(parsed)
          ? parsed.filter((id) => typeof id === 'number' && !isNaN(id))
          : [];
      } catch {
        return [];
      }
    }

    return [];
  }
}
