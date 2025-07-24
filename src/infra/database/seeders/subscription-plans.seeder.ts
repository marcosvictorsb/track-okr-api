import { SubscriptionPlanModel } from '@infra/database/models/subscription-plan.model';

export async function seedDefaultPlans(): Promise<void> {
  try {
    // Verificar se já existem planos
    const existingPlans = await SubscriptionPlanModel.findAll();

    if (existingPlans.length > 0) {
      console.log('Planos já existem no banco de dados');
      return;
    }

    const defaultPlans = [
      {
        name: 'Starter',
        description: 'Plano básico para pequenas equipes',
        max_users: 5,
        price_monthly: 29.9,
        price_yearly: 299.0,
        features: {
          dashboard: true,
          reports: 'basic',
          integrations: false,
          support: 'email',
          custom_branding: false,
          api_access: false,
          advanced_analytics: false,
          max_teams: 2,
          max_objectives: 20
        },
        is_active: true
      },
      {
        name: 'Professional',
        description: 'Plano completo para equipes em crescimento',
        max_users: 25,
        price_monthly: 79.9,
        price_yearly: 799.0,
        features: {
          dashboard: true,
          reports: 'advanced',
          integrations: true,
          support: 'priority',
          custom_branding: true,
          api_access: true,
          advanced_analytics: true,
          bulk_import: true,
          custom_fields: true,
          max_teams: 10,
          max_objectives: 100
        },
        is_active: true
      },
      {
        name: 'Enterprise',
        description: 'Plano para grandes organizações',
        max_users: 100,
        price_monthly: 199.9,
        price_yearly: 1999.0,
        features: {
          dashboard: true,
          reports: 'enterprise',
          integrations: true,
          support: 'dedicated',
          custom_branding: true,
          api_access: true,
          advanced_analytics: true,
          bulk_import: true,
          custom_fields: true,
          sso: true,
          audit_logs: true,
          custom_permissions: true,
          white_label: true,
          max_teams: 50,
          max_objectives: 500
        },
        is_active: true
      },
      {
        name: 'Free Trial',
        description: 'Plano gratuito para teste',
        max_users: 3,
        price_monthly: 0,
        features: {
          dashboard: true,
          reports: 'basic',
          integrations: false,
          support: 'community',
          custom_branding: false,
          api_access: false,
          trial_period_days: 14,
          max_teams: 1,
          max_objectives: 10
        },
        is_active: true
      }
    ];

    // Criar planos no banco
    for (const planData of defaultPlans) {
      await SubscriptionPlanModel.create(planData);
      console.log(`Plano "${planData.name}" criado com sucesso`);
    }

    console.log('Todos os planos padrão foram criados!');
  } catch (error) {
    console.error('Erro ao criar planos padrão:', error);
    throw error;
  }
}

// Executar seeder se chamado diretamente
if (require.main === module) {
  seedDefaultPlans()
    .then(() => {
      console.log('Seeder executado com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro no seeder:', error);
      process.exit(1);
    });
}
