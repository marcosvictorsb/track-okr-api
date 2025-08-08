# Dashboard Gerencial - Track OKR

Este documento descreve as APIs para um dashboard estratégico focado em tomada de decisão gerencial, com métricas acionáveis e insights para liderança empresarial.

## Métricas Estratégicas para Tomada de Decisão

### 🎯 **Métricas de Performance Organizacional**

- **Taxa de conclusão de OKRs** - Indica eficácia da execução estratégica
- **Velocidade de progresso** - Identifica gargalos e aceleração necessária
- **Alinhamento estratégico** - Mostra se os times estão focados nos objetivos corretos

### 📈 **Indicadores de Crescimento e Sustentabilidade**

- **Crescimento de leads qualificados** - Previsibilidade de receita futura
- **Taxa de conversão por fonte** - ROI dos canais de aquisição
- **Churn de clientes vs. novos contratos** - Saúde do negócio

### 👥 **Métricas de Produtividade e Engajamento**

- **Engajamento dos times** - Frequência de atualizações e participação
- **Performance comparativa entre times** - Identificar melhores práticas e gaps
- **Utilização da plataforma** - Adoção e eficácia da ferramenta

### 💰 **Indicadores Financeiros e de Rentabilidade**

- **MRR e tendência de crescimento** - Sustentabilidade financeira
- **CAC vs LTV** - Eficiência de aquisição de clientes
- **Margem por cliente/plano** - Rentabilidade por segmento

## APIs Estratégicas para Dashboard Gerencial

### 1. Visão Executiva de Performance

#### GET /api/dashboard/executive-performance

**Descrição**: KPIs críticos para decisões estratégicas imediatas

**Exemplo de Resposta**:

```json
{
  "success": true,
  "data": {
    "critical_metrics": {
      "okr_execution_health": {
        "current_quarter_completion": 68.5,
        "target_completion": 75.0,
        "status": "at_risk",
        "action_needed": "Acelerar 3 objetivos críticos"
      },
      "business_momentum": {
        "lead_velocity": {
          "current": 45,
          "target": 50,
          "trend": "declining"
        },
        "conversion_efficiency": {
          "current": 8.2,
          "previous": 6.8,
          "improvement": "+20.6%"
        }
      },
      "revenue_health": {
        "mrr_growth": 12.5,
        "churn_rate": 3.2,
        "net_revenue_retention": 108.5,
        "runway_months": 18
      }
    },
    "alerts": [
      {
        "type": "urgent",
        "message": "Time de Vendas está 25% abaixo da meta trimestral",
        "action": "Revisar estratégia de vendas"
      },
      {
        "type": "opportunity",
        "message": "Leads do canal orgânico cresceram 45% - considerar investir mais",
        "action": "Ampliar estratégia de SEO"
      }
    ],
    "quick_wins": [
      {
        "opportunity": "3 objetivos próximos de conclusão (>90%)",
        "impact": "Pode elevar taxa de conclusão para 75%",
        "effort": "baixo"
      }
    ]
  }
}
```

### 2. Análise de Execução e Bloqueios

#### GET /api/dashboard/execution-analysis

**Descrição**: Identifica gargalos e bloqueios na execução estratégica

**Query Parameters**:

- `team_id` (opcional): Filtrar por time específico
- `risk_level`: 'high' | 'medium' | 'low' | 'all'

**Exemplo de Resposta**:

```json
{
  "success": true,
  "data": {
    "execution_health": {
      "overall_score": 7.2,
      "teams_on_track": 8,
      "teams_at_risk": 3,
      "teams_critical": 1
    },
    "blocking_issues": [
      {
        "team": "Engineering",
        "objective": "Reduzir tempo de deploy",
        "blocker": "Dependência externa não resolvida",
        "days_blocked": 12,
        "impact": "high",
        "suggested_action": "Escalar para CTO ou buscar alternativa"
      }
    ],
    "velocity_analysis": {
      "fast_movers": [
        {
          "team": "Marketing",
          "completion_velocity": 1.8,
          "factor": "Processos bem definidos e automação"
        }
      ],
      "slow_movers": [
        {
          "team": "Sales",
          "completion_velocity": 0.6,
          "factor": "Falta de clareza nas métricas"
        }
      ]
    },
    "resource_allocation": {
      "over_allocated": ["Product Team"],
      "under_allocated": ["Customer Success"],
      "optimal": ["Marketing", "Engineering"]
    }
  }
}
```

### 3. Inteligência de Negócio e ROI

#### GET /api/dashboard/business-intelligence

**Descrição**: ROI de investimentos e eficácia das estratégias de crescimento

**Query Parameters**:

- `period`: '30d' | '90d' | '180d' | '1y'
- `segment`: 'enterprise' | 'smb' | 'all'

**Exemplo de Resposta**:

```json
{
  "success": true,
  "data": {
    "roi_analysis": {
      "customer_acquisition": {
        "cac_by_channel": {
          "content_marketing": {
            "cost": 89.5,
            "ltv": 2400.0,
            "ratio": 26.8,
            "recommendation": "scale_up"
          },
          "paid_ads": {
            "cost": 245.0,
            "ltv": 1200.0,
            "ratio": 4.9,
            "recommendation": "optimize_or_pause"
          }
        },
        "payback_period": {
          "average": 4.2,
          "target": 6.0,
          "status": "healthy"
        }
      },
      "feature_adoption": {
        "high_value_features": [
          {
            "feature": "advanced_reporting",
            "adoption_rate": 78.5,
            "revenue_impact": "+32%",
            "churn_reduction": "15%"
          }
        ],
        "underused_features": [
          {
            "feature": "team_collaboration",
            "adoption_rate": 23.1,
            "potential_value": "Redução de 20% no tempo de alinhamento"
          }
        ]
      },
      "market_opportunities": [
        {
          "segment": "Mid-market tech companies",
          "potential_value": 156000.0,
          "investment_needed": 25000.0,
          "timeline": "Q3-Q4",
          "confidence": "high"
        }
      ]
    }
  }
}
```

### 4. Eficiência Organizacional e Produtividade

#### GET /api/dashboard/organizational-efficiency

**Descrição**: Métricas de produtividade e eficiência operacional

**Exemplo de Resposta**:

```json
{
  "success": true,
  "data": {
    "productivity_metrics": {
      "goal_achievement_rate": {
        "current": 78.5,
        "industry_benchmark": 65.0,
        "competitive_advantage": "+13.5 pontos"
      },
      "decision_velocity": {
        "avg_time_to_complete_okr": 11.2,
        "target": 12.0,
        "improvement": "6.7% melhor que target"
      },
      "collaboration_efficiency": {
        "cross_team_objectives": 23,
        "alignment_score": 8.7,
        "communication_frequency": "alta"
      }
    },
    "capacity_optimization": {
      "team_utilization": [
        {
          "team": "Engineering",
          "utilization": 95.2,
          "status": "overloaded",
          "recommendation": "Adicionar 1-2 pessoas ou revisar scope"
        },
        {
          "team": "Sales",
          "utilization": 67.8,
          "status": "underutilized",
          "recommendation": "Aumentar targets ou realocar recursos"
        }
      ],
      "skill_gaps": [
        {
          "area": "Data Analysis",
          "current_capacity": 40,
          "needed_capacity": 70,
          "action": "Contratar ou treinar 2 pessoas"
        }
      ]
    },
    "leadership_effectiveness": {
      "okr_coaching_frequency": 2.3,
      "team_autonomy_score": 7.8,
      "escalation_rate": 12.5,
      "manager_effectiveness": 8.2
    }
  }
}
```

### 5. Sustentabilidade Financeira e Crescimento

#### GET /api/dashboard/financial-health

**Descrição**: Métricas financeiras estratégicas para decisões de investimento

**Exemplo de Resposta**:

```json
{
  "success": true,
  "data": {
    "growth_sustainability": {
      "revenue_growth_rate": 15.8,
      "sustainable_growth_rate": 12.0,
      "cash_burn_rate": 45000.0,
      "runway_months": 24.5,
      "break_even_timeline": "Q2 2026"
    },
    "unit_economics": {
      "ltv_cac_ratio": 4.2,
      "gross_margin": 87.5,
      "net_revenue_retention": 112.8,
      "monthly_churn": 2.1,
      "expansion_revenue": 28.4
    },
    "investment_priorities": [
      {
        "area": "Sales Team Expansion",
        "investment": 120000.0,
        "expected_roi": 3.8,
        "payback_months": 8,
        "risk_level": "low"
      },
      {
        "area": "Product Development",
        "investment": 200000.0,
        "expected_roi": 5.2,
        "payback_months": 12,
        "risk_level": "medium"
      }
    ],
    "cash_flow_forecast": {
      "next_quarter": {
        "revenue": 284000.0,
        "expenses": 198000.0,
        "net_cash_flow": 86000.0
      },
      "funding_needs": {
        "next_12_months": 540000.0,
        "confidence": "high",
        "trigger_points": ["When runway < 12 months"]
      }
    }
  }
}
```

### 6. Central de Decisões Estratégicas

#### GET /api/dashboard/strategic-decisions

**Descrição**: Recomendações baseadas em dados para decisões críticas

**Exemplo de Resposta**:

```json
{
  "success": true,
  "data": {
    "urgent_decisions": [
      {
        "priority": "critical",
        "decision": "Realocação de recursos do time de Marketing",
        "context": "Performance 40% acima do esperado vs Sales 25% abaixo",
        "options": [
          {
            "action": "Mover 1 pessoa de Marketing para Sales",
            "pros": ["Acelera vendas", "Balanceia carga"],
            "cons": ["Pode reduzir lead generation"],
            "impact_score": 8.5
          }
        ],
        "deadline": "2025-07-25",
        "financial_impact": 45000.0
      }
    ],
    "strategic_opportunities": [
      {
        "opportunity": "Expansão para mercado Enterprise",
        "confidence": 82,
        "investment_required": 180000.0,
        "potential_return": 720000.0,
        "timeline": "6-9 meses",
        "key_risks": ["Competição acirrada", "Ciclo de venda longo"]
      }
    ],
    "performance_alerts": [
      {
        "metric": "Customer Churn",
        "current_value": 4.2,
        "threshold": 3.0,
        "trend": "increasing",
        "root_cause": "Falta de onboarding estruturado",
        "suggested_actions": [
          "Implementar programa de Customer Success",
          "Automatizar onboarding inicial"
        ]
      }
    ],
    "competitive_insights": {
      "market_position": "strong",
      "key_differentiators": [
        "Velocidade de implementação 30% superior",
        "Interface mais intuitiva"
      ],
      "threats": [
        "Concorrente X lançou feature similar",
        "Pressão de preço no segmento SMB"
      ]
    }
  }
}
```

## Framework de Decisão para Gerência

### Métricas Priorizadas por Impacto

#### 🔥 **Críticas (Verificar Diariamente)**

1. **Runway financeiro** - Tempo até precisar de financiamento
2. **Objetivos em risco** - OKRs que podem não ser atingidos
3. **Churn rate** - Taxa de cancelamento de clientes
4. **Pipeline de vendas** - Previsibilidade de receita

#### 📊 **Importantes (Verificar Semanalmente)**

1. **Velocity de execução** - Velocidade de progresso dos times
2. **Utilização de recursos** - Eficiência das equipes
3. **NPS e satisfação** - Saúde do relacionamento com clientes
4. **Conversão de leads** - Eficácia do funil de vendas

#### 📈 **Estratégicas (Verificar Mensalmente)**

1. **Market share e competição** - Posicionamento no mercado
2. **ROI de investimentos** - Retorno das iniciativas
3. **Capacidade vs demanda** - Planejamento de recursos
4. **Inovação e diferenciação** - Vantagem competitiva

### Alertas Inteligentes

**Sistema de notificações baseado em thresholds:**

```json
{
  "alert_types": {
    "financial": {
      "runway_months": { "critical": 6, "warning": 12 },
      "burn_rate_increase": { "critical": 25, "warning": 15 },
      "churn_rate": { "critical": 5, "warning": 3 }
    },
    "operational": {
      "objectives_at_risk": { "critical": 30, "warning": 20 },
      "team_utilization": { "critical": 95, "warning": 85 },
      "update_frequency": { "critical": 7, "warning": 14 }
    },
    "growth": {
      "conversion_drop": { "critical": 25, "warning": 15 },
      "lead_velocity": { "critical": -20, "warning": -10 }
    }
  }
}
```

## Implementação Recomendada

### Estrutura de Controllers Executivos

```
src/domains/api/dashboard/executive/
├── controllers/
│   ├── strategic-performance.controller.ts
│   ├── execution-analysis.controller.ts
│   ├── business-intelligence.controller.ts
│   ├── organizational-efficiency.controller.ts
│   ├── financial-health.controller.ts
│   └── strategic-decisions.controller.ts
├── services/
│   ├── executive-insights.service.ts
│   ├── decision-engine.service.ts
│   └── alert-system.service.ts
└── interfaces/
    └── executive-dashboard.interface.ts
```

### Considerações Específicas para Gerência

1. **Contextualização**: Sempre incluir o "por quê" das métricas
2. **Ação**: Cada insight deve vir com recomendações claras
3. **Priorização**: Focar no que realmente impacta o negócio
4. **Velocidade**: Dados atualizados e carregamento rápido
5. **Simplicidade**: Evitar informações desnecessárias

### Próximos Passos

1. **Implementar alertas inteligentes** baseados em machine learning
2. **Criar benchmarks** com dados da indústria
3. **Desenvolver simuladores** de cenários (what-if analysis)
4. **Integrar dados externos** (mercado, concorrência)
5. **Implementar recomendações automatizadas** baseadas em padrões
