import {
  CreateFreeSubscriptionInput,
  CreateSubscriptionCriteria,
  CreateTrialSubscriptionInteractorDependencies,
  ICreateTrialSubscriptionGateway,
  SubscriptionStatus
} from '../interfaces';

export class CreateTrialSubscriptionInteractor {
  private gateway: ICreateTrialSubscriptionGateway;

  constructor(params: CreateTrialSubscriptionInteractorDependencies) {
    this.gateway = params.gateway;
  }

  async execute(input: CreateFreeSubscriptionInput): Promise<void> {
    this.gateway.loggerInfo('Iniciando criação de assinatura gratuita', {
      requestTxt: JSON.stringify(input)
    });

    const { id_company, isBeta = false } = input;

    const freePlan = await this.gateway.findPlanTrial({
      isTrial: true,
      name: isBeta ? 'Plano Beta' : 'Plano Gratuito'
    });

    this.gateway.loggerInfo(
      'Plano gratuito encontrado para criar a assinatura',
      {
        plan_id: freePlan?.id,
        plan_name: freePlan?.name
      }
    );

    // 5. Criar a subscription com trial baseado no tipo
    const now = new Date();
    const trialEndDate = new Date();

    if (isBeta) {
      // Beta: 3 meses
      trialEndDate.setMonth(now.getMonth() + 3);
    } else {
      // Trial normal: 14 dias
      trialEndDate.setDate(now.getDate() + 14);
    }

    const dataCreatetrialSubscription: CreateSubscriptionCriteria = {
      company_id: id_company,
      plan_id: freePlan?.id as number,
      status: SubscriptionStatus.TRIAL,
      trial_start_date: new Date(),
      trial_end_date: trialEndDate,
      started_at: new Date(),
      expires_at: trialEndDate,
      auto_renew: false
    };

    const trial = await this.gateway.createTrialSubscription(
      dataCreatetrialSubscription
    );

    this.gateway.loggerInfo('Assinatura gratuita criada com sucesso', {
      requestTxt: JSON.stringify(trial)
    });
  }
}
