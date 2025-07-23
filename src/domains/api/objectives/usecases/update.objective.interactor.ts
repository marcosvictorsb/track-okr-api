import { HttpResponse } from '@protocols/http';
import {
  UpdateObjectiveInteractorDependencies,
  InputUpdateObjective,
  IUpdateObjectiveGateway
} from '@domains/api/objectives/interfaces';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';

export class UpdateObjectiveInteractor {
  protected gateway: IUpdateObjectiveGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: UpdateObjectiveInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  async execute(input: InputUpdateObjective): Promise<HttpResponse> {
    try {
      const {
        id,
        title,
        description,
        status,
        quarter,
        year,
        id_company,
        id_user,
        id_team,
        id_planner
      } = input;

      this.gateway.loggerInfo('Iniciando atualização do objetivo', {
        title,
        description,
        year,
        id_company,
        id_user
      });

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

      // Verificar se o objetivo existe e pertence à empresa
      const existingObjective = await this.gateway.findObjective({
        id
      });
      if (!existingObjective) {
        this.gateway.loggerInfo('Objetivo não encontrado', { id_company });
        return this.presenter.notFound('Objetivo não encontrado');
      }

      // Validar quarter se fornecido
      if (quarter !== undefined && (quarter < 1 || quarter > 4)) {
        this.gateway.loggerInfo('Quarter inválido', { year });
        return this.presenter.badRequest('Quarter deve estar entre 1 e 4');
      }

      // Validar year se fornecido
      if (year !== undefined) {
        const currentYear = new Date().getFullYear();
        if (year < 2020 || year > currentYear + 10) {
          this.gateway.loggerInfo('Ano inválido', { year });
          return this.presenter.badRequest('Ano inválido');
        }
      }

      const updateData: Record<string, unknown> = { updated_at: new Date() };

      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;
      if (quarter !== undefined) updateData.quarter = quarter;
      if (year !== undefined) updateData.year = year;
      if (id_team !== undefined) updateData.id_team = id_team;
      if (id_planner !== undefined) updateData.id_planner = id_planner;

      const objective = await this.gateway.update(id, updateData);

      if (!objective) {
        this.gateway.loggerError('Erro ao atualizar o objetivo', {
          id_company
        });
        return this.presenter.serverError('Erro ao atualizar o objetivo');
      }

      this.gateway.loggerInfo('Objetivo atualizado com sucesso', {
        id_company
      });

      const team = await this.gateway.findTeam({
        id: objective.id_team
      });

      if (!team) {
        this.gateway.loggerError('Equipe não encontrada para o objetivo', {
          id_team: objective.id_team
        });
        objective.team_name = 'Equipe não encontrada';
      }

      return this.presenter.ok({
        ...objective,
        team_name: team?.name
      });
    } catch (error) {
      this.gateway.loggerError('Erro ao atualizar o objetivo', {
        error: String(error)
      });
      return this.presenter.serverError('Erro ao atualizar o objetivo');
    }
  }
}
