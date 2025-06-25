import { HttpResponse } from "@protocols/http";
import { CreatePlannerInteractorDependencies, InputCreatePlanner } from "../interfaces/";
import { IPresenter } from "@protocols/presenter";
import { CreatePlannerGateway } from "../gateways/create.planner";

export class CreatePlannerInteractor {
  protected gateway: CreatePlannerGateway;
  protected presenter: IPresenter;

  constructor(params: CreatePlannerInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  async execute(input: InputCreatePlanner): Promise<HttpResponse> {
    try {
      const { description, title, year, id_company } = input;
      this.gateway.loggerInfo('Iniciando criação do planejamento anual', { description, title, year, id_company });
      
      const criteria = { title, description, year, id_company };
      const existingPlanner = await this.gateway.findPlanner(criteria);
      if (existingPlanner) {
        this.gateway.loggerInfo('Planner já existe', { description, title, year, id_company });
        return this.presenter.conflict('Planner já existe');
      }
      const planner = await this.gateway.createPlanner(criteria);
      this.gateway.loggerInfo('Planner criado com sucesso');      
     

      return this.presenter.created(planner);
    } catch (error) {
      this.gateway.loggerError('Erro ao criar o planejamento anual', { error });
      return this.presenter.serverError('Error ao criar o planejamento anual');
    }
  }
}