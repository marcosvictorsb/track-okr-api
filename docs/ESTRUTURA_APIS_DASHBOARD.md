# 📊 Estrutura de APIs para Dashboard CEO - GUNNO

## 🎯 Resumo Executivo

O Dashboard CEO possui **11 seções principais** que necessitam de integração com APIs para substituir os dados mockados. Este documento detalha a estrutura completa de endpoints, parâmetros e formato de resposta para cada seção do dashboard.

---

## 🔗 Endpoints Necessários

### 1. **GET `/api/dashboard/overview`** - Visão Geral do Trimestre

**Descrição:** Dados consolidados do trimestre atual incluindo progresso geral, estatísticas de OKRs e comparações.

**Response:**

```json
{
  "quarter": "Q4",
  "year": 2024,
  "progress": 73,
  "totalObjectives": 24,
  "onTrack": 18,
  "atRisk": 4,
  "delayed": 2,
  "completedKeyResults": 67,
  "totalKeyResults": 89,
  "avgTeamPerformance": 76,
  "trendsComparison": {
    "lastQuarter": 68,
    "change": 5
  },
  "statistics": {
    "generalProgress": {
      "value": 73,
      "change": 5,
      "trend": "up"
    },
    "completedOkrs": {
      "value": 18,
      "total": 24,
      "change": 3,
      "trend": "up"
    },
    "engagement": {
      "value": 92,
      "change": 8,
      "trend": "up"
    },
    "averageRisk": {
      "value": 12,
      "change": -3,
      "trend": "down"
    },
    "averageCheckIns": 4.2,
    "weeklyProgress": 8.5
  }
}
```

---

### 2. **GET `/api/dashboard/teams`** - Desempenho por Time

**Descrição:** Performance individual de cada time incluindo progresso, OKRs e status.

**Response:**

```json
{
  "teams": [
    {
      "id": "1",
      "name": "Engineering",
      "progress": 85,
      "objectives": 8,
      "keyResults": 24,
      "status": "excellent",
      "trend": "up",
      "members": 12,
      "lastUpdate": "2024-11-15T10:30:00Z"
    },
    {
      "id": "2",
      "name": "Marketing",
      "progress": 72,
      "objectives": 6,
      "keyResults": 18,
      "status": "good",
      "trend": "up",
      "members": 8,
      "lastUpdate": "2024-11-14T16:20:00Z"
    },
    {
      "id": "3",
      "name": "Sales",
      "progress": 68,
      "objectives": 5,
      "keyResults": 15,
      "status": "warning",
      "trend": "stable",
      "members": 6,
      "lastUpdate": "2024-11-13T14:15:00Z"
    },
    {
      "id": "4",
      "name": "Product",
      "progress": 91,
      "objectives": 4,
      "keyResults": 12,
      "status": "excellent",
      "trend": "up",
      "members": 5,
      "lastUpdate": "2024-11-15T09:45:00Z"
    },
    {
      "id": "5",
      "name": "Operations",
      "progress": 56,
      "objectives": 3,
      "keyResults": 9,
      "status": "danger",
      "trend": "down",
      "members": 4,
      "lastUpdate": "2024-11-12T11:30:00Z"
    }
  ]
}
```

---

### 3. **GET `/api/dashboard/contributors`** - Top Contribuidores

**Descrição:** Lista dos colaboradores mais ativos e com maior impacto nos OKRs.

**Response:**

```json
{
  "contributors": [
    {
      "id": 1,
      "name": "Ana Silva",
      "email": "ana.silva@empresa.com",
      "avatar": "https://api.empresa.com/avatars/ana-silva.jpg",
      "team": {
        "id": "1",
        "name": "Engineering"
      },
      "contributions": 24,
      "impactScore": 95,
      "lastActivity": "2024-11-15T10:30:00Z",
      "keyResultsUpdated": 8,
      "checkInsThisWeek": 3
    },
    {
      "id": 2,
      "name": "Carlos Santos",
      "email": "carlos.santos@empresa.com",
      "avatar": "https://api.empresa.com/avatars/carlos-santos.jpg",
      "team": {
        "id": "4",
        "name": "Product"
      },
      "contributions": 22,
      "impactScore": 92,
      "lastActivity": "2024-11-15T09:15:00Z",
      "keyResultsUpdated": 6,
      "checkInsThisWeek": 4
    },
    {
      "id": 3,
      "name": "Marina Costa",
      "email": "marina.costa@empresa.com",
      "avatar": "https://api.empresa.com/avatars/marina-costa.jpg",
      "team": {
        "id": "2",
        "name": "Marketing"
      },
      "contributions": 20,
      "impactScore": 88,
      "lastActivity": "2024-11-14T16:45:00Z",
      "keyResultsUpdated": 5,
      "checkInsThisWeek": 2
    },
    {
      "id": 4,
      "name": "João Pereira",
      "email": "joao.pereira@empresa.com",
      "avatar": "https://api.empresa.com/avatars/joao-pereira.jpg",
      "team": {
        "id": "3",
        "name": "Sales"
      },
      "contributions": 19,
      "impactScore": 85,
      "lastActivity": "2024-11-14T14:20:00Z",
      "keyResultsUpdated": 4,
      "checkInsThisWeek": 3
    },
    {
      "id": 5,
      "name": "Lucia Rodrigues",
      "email": "lucia.rodrigues@empresa.com",
      "avatar": "https://api.empresa.com/avatars/lucia-rodrigues.jpg",
      "team": {
        "id": "5",
        "name": "Operations"
      },
      "contributions": 18,
      "impactScore": 82,
      "lastActivity": "2024-11-13T12:10:00Z",
      "keyResultsUpdated": 3,
      "checkInsThisWeek": 1
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 5,
    "hasNext": true
  }
}
```

---

### 4. **GET `/api/dashboard/temporal-evolution`** - Evolução Temporal

**Descrição:** Dados históricos de progresso para visualização de tendências ao longo do tempo.

**Response:**

```json
{
  "period": "monthly",
  "labels": [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ],
  "currentQuarter": {
    "name": "Q4 2024",
    "data": [45, 52, 58, 65, 72, 68, 75, 78, 82, 79, 73, 76],
    "color": "#3B82F6"
  },
  "previousQuarter": {
    "name": "Q3 2024",
    "data": [38, 45, 48, 55, 62, 59, 65, 68, 71, 73, 68, 70],
    "color": "#94A3B8"
  },
  "comparison": {
    "improvement": 8.57,
    "bestMonth": "Oct",
    "worstMonth": "May"
  }
}
```

---

### 5. **GET `/api/dashboard/success-criteria`** - Critérios de Sucesso

**Descrição:** Agrupamento de OKRs por critérios de sucesso definidos pela empresa.

**Response:**

```json
{
  "criteria": [
    {
      "id": 1,
      "name": "Receita",
      "type": "quantitative",
      "category": "financial",
      "okrsCount": 5,
      "averageProgress": 87,
      "description": "Métricas relacionadas à receita da empresa",
      "icon": "pi-dollar",
      "color": "#10B981",
      "objectives": [
        {
          "id": 101,
          "title": "Aumentar receita SaaS em 25%",
          "progress": 85
        },
        {
          "id": 102,
          "title": "Reduzir CAC em 15%",
          "progress": 90
        }
      ]
    },
    {
      "id": 2,
      "name": "Satisfação Cliente",
      "type": "qualitative",
      "category": "customer",
      "okrsCount": 3,
      "averageProgress": 92,
      "description": "Métricas de satisfação e NPS",
      "icon": "pi-heart",
      "color": "#3B82F6",
      "objectives": [
        {
          "id": 103,
          "title": "NPS acima de 4.5",
          "progress": 95
        }
      ]
    },
    {
      "id": 3,
      "name": "Retenção Talentos",
      "type": "quantitative",
      "category": "hr",
      "okrsCount": 4,
      "averageProgress": 78,
      "description": "Métricas de retenção e desenvolvimento de pessoas",
      "icon": "pi-users",
      "color": "#8B5CF6",
      "objectives": []
    },
    {
      "id": 4,
      "name": "Inovação",
      "type": "qualitative",
      "category": "product",
      "okrsCount": 6,
      "averageProgress": 65,
      "description": "Iniciativas de inovação e desenvolvimento de produto",
      "icon": "pi-lightbulb",
      "color": "#F59E0B",
      "objectives": []
    },
    {
      "id": 5,
      "name": "Sustentabilidade",
      "type": "quantitative",
      "category": "sustainability",
      "okrsCount": 2,
      "averageProgress": 83,
      "description": "Métricas ambientais e sustentabilidade",
      "icon": "pi-globe",
      "color": "#059669",
      "objectives": []
    }
  ]
}
```

---

### 6. **GET `/api/dashboard/at-risk-okrs`** - OKRs em Risco

**Descrição:** Objetivos que estão atrasados, em risco ou em situação crítica.

**Response:**

```json
{
  "atRiskOkrs": [
    {
      "id": 1,
      "objectiveId": 101,
      "objective": "Aumentar receita SaaS em 25%",
      "status": "critical",
      "progress": 45,
      "targetProgress": 70,
      "lastUpdate": "2024-11-10T14:30:00Z",
      "responsible": {
        "id": 15,
        "name": "Carlos Santos",
        "email": "carlos.santos@empresa.com",
        "avatar": "https://api.empresa.com/avatars/carlos-santos.jpg"
      },
      "team": {
        "id": "3",
        "name": "Sales"
      },
      "daysRemaining": 45,
      "riskFactors": ["Baixa conversão de leads", "Mercado competitivo"],
      "keyResults": [
        {
          "id": 201,
          "title": "Aumentar MRR para R$ 500k",
          "progress": 40,
          "target": 500000,
          "current": 200000,
          "unit": "BRL"
        },
        {
          "id": 202,
          "title": "Conversão de leads > 15%",
          "progress": 50,
          "target": 15,
          "current": 7.5,
          "unit": "%"
        }
      ]
    },
    {
      "id": 2,
      "objectiveId": 102,
      "objective": "Implementar 5 funcionalidades AI",
      "status": "at-risk",
      "progress": 60,
      "targetProgress": 75,
      "lastUpdate": "2024-11-12T10:15:00Z",
      "responsible": {
        "id": 10,
        "name": "Ana Silva",
        "email": "ana.silva@empresa.com",
        "avatar": "https://api.empresa.com/avatars/ana-silva.jpg"
      },
      "team": {
        "id": "1",
        "name": "Engineering"
      },
      "daysRemaining": 60,
      "riskFactors": ["Complexidade técnica alta", "Recursos limitados"],
      "keyResults": [
        {
          "id": 203,
          "title": "Integração com OpenAI",
          "progress": 75,
          "target": 1,
          "current": 0,
          "unit": "feature"
        }
      ]
    },
    {
      "id": 3,
      "objectiveId": 103,
      "objective": "Reduzir churn para 3%",
      "status": "delayed",
      "progress": 38,
      "targetProgress": 65,
      "lastUpdate": "2024-11-08T16:45:00Z",
      "responsible": {
        "id": 12,
        "name": "Marina Costa",
        "email": "marina.costa@empresa.com",
        "avatar": "https://api.empresa.com/avatars/marina-costa.jpg"
      },
      "team": {
        "id": "2",
        "name": "Marketing"
      },
      "daysRemaining": 38,
      "riskFactors": [
        "Falta de programa de retenção",
        "Feedback negativo de clientes"
      ],
      "keyResults": [
        {
          "id": 204,
          "title": "Churn mensal < 3%",
          "progress": 38,
          "target": 3,
          "current": 5.2,
          "unit": "%"
        }
      ]
    }
  ],
  "summary": {
    "total": 3,
    "critical": 1,
    "atRisk": 1,
    "delayed": 1
  }
}
```

---

### 7. **GET `/api/dashboard/recent-checkins`** - Check-ins Recentes

**Descrição:** Atualizações recentes de Key Results pelos colaboradores.

**Response:**

```json
{
  "checkIns": [
    {
      "id": 1,
      "user": {
        "id": 10,
        "name": "Ana Silva",
        "avatar": "https://api.empresa.com/avatars/ana-silva.jpg"
      },
      "team": {
        "id": "1",
        "name": "Engineering"
      },
      "keyResult": {
        "id": 201,
        "title": "Implementar funcionalidades AI",
        "objectiveId": 102,
        "objective": "Implementar 5 funcionalidades AI"
      },
      "oldValue": 65,
      "newValue": 75,
      "changePercent": 15.38,
      "changeType": "increase",
      "date": "2024-11-15T10:30:00Z",
      "comment": "Finalizamos a integração com OpenAI. Próximo passo é testar em produção.",
      "attachments": [
        {
          "type": "image",
          "url": "https://api.empresa.com/files/screenshot-ai-integration.png",
          "filename": "screenshot-ai-integration.png"
        }
      ]
    },
    {
      "id": 2,
      "user": {
        "id": 15,
        "name": "Carlos Santos",
        "avatar": "https://api.empresa.com/avatars/carlos-santos.jpg"
      },
      "team": {
        "id": "3",
        "name": "Sales"
      },
      "keyResult": {
        "id": 202,
        "title": "Aumentar receita SaaS",
        "objectiveId": 101,
        "objective": "Aumentar receita SaaS em 25%"
      },
      "oldValue": 42,
      "newValue": 45,
      "changePercent": 7.14,
      "changeType": "increase",
      "date": "2024-11-15T09:15:00Z",
      "comment": "Fechamos 3 novos contratos esta semana. Pipeline está aquecendo.",
      "attachments": []
    },
    {
      "id": 3,
      "user": {
        "id": 12,
        "name": "Marina Costa",
        "avatar": "https://api.empresa.com/avatars/marina-costa.jpg"
      },
      "team": {
        "id": "2",
        "name": "Marketing"
      },
      "keyResult": {
        "id": 204,
        "title": "Campanha de retenção",
        "objectiveId": 103,
        "objective": "Reduzir churn para 3%"
      },
      "oldValue": 60,
      "newValue": 68,
      "changePercent": 13.33,
      "changeType": "increase",
      "date": "2024-11-14T16:45:00Z",
      "comment": "Campanha de email marketing teve boa aceitação. CTR de 8,5%.",
      "attachments": [
        {
          "type": "document",
          "url": "https://api.empresa.com/files/campaign-report.pdf",
          "filename": "campaign-report.pdf"
        }
      ]
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "hasNext": true
  }
}
```

---

### 8. **GET `/api/dashboard/measurement-schedule`** - Agenda de Medições

**Descrição:** Cronograma de próximas medições e Key Results em atraso.

**Response:**

```json
{
  "schedule": [
    {
      "id": 1,
      "keyResult": {
        "id": 201,
        "title": "Receita SaaS trimestral",
        "objectiveId": 101,
        "objective": "Aumentar receita SaaS em 25%"
      },
      "responsible": {
        "id": 15,
        "name": "Carlos Santos",
        "email": "carlos.santos@empresa.com",
        "avatar": "https://api.empresa.com/avatars/carlos-santos.jpg"
      },
      "nextMeasurement": "2024-11-20T09:00:00Z",
      "frequency": "weekly",
      "overdue": false,
      "daysUntilNext": 5,
      "lastMeasurement": "2024-11-13T09:00:00Z",
      "measurementHistory": [
        {
          "date": "2024-11-13T09:00:00Z",
          "value": 45,
          "comment": "Progresso constante"
        },
        {
          "date": "2024-11-06T09:00:00Z",
          "value": 42,
          "comment": "Início do mês fraco"
        }
      ]
    },
    {
      "id": 2,
      "keyResult": {
        "id": 202,
        "title": "NPS Cliente",
        "objectiveId": 103,
        "objective": "NPS acima de 4.5"
      },
      "responsible": {
        "id": 12,
        "name": "Marina Costa",
        "email": "marina.costa@empresa.com",
        "avatar": "https://api.empresa.com/avatars/marina-costa.jpg"
      },
      "nextMeasurement": "2024-11-18T14:00:00Z",
      "frequency": "bi-weekly",
      "overdue": false,
      "daysUntilNext": 3,
      "lastMeasurement": "2024-11-04T14:00:00Z",
      "measurementHistory": []
    },
    {
      "id": 3,
      "keyResult": {
        "id": 203,
        "title": "Performance da API",
        "objectiveId": 102,
        "objective": "Implementar 5 funcionalidades AI"
      },
      "responsible": {
        "id": 10,
        "name": "Ana Silva",
        "email": "ana.silva@empresa.com",
        "avatar": "https://api.empresa.com/avatars/ana-silva.jpg"
      },
      "nextMeasurement": "2024-11-15T11:00:00Z",
      "frequency": "daily",
      "overdue": true,
      "daysOverdue": 2,
      "lastMeasurement": "2024-11-12T11:00:00Z",
      "measurementHistory": []
    },
    {
      "id": 4,
      "keyResult": {
        "id": 204,
        "title": "Taxa de conversão",
        "objectiveId": 101,
        "objective": "Aumentar receita SaaS em 25%"
      },
      "responsible": {
        "id": 14,
        "name": "João Pereira",
        "email": "joao.pereira@empresa.com",
        "avatar": "https://api.empresa.com/avatars/joao-pereira.jpg"
      },
      "nextMeasurement": "2024-11-22T10:00:00Z",
      "frequency": "weekly",
      "overdue": false,
      "daysUntilNext": 7,
      "lastMeasurement": "2024-11-15T10:00:00Z",
      "measurementHistory": []
    }
  ],
  "summary": {
    "total": 4,
    "overdue": 1,
    "dueToday": 0,
    "dueThisWeek": 2
  }
}
```

---

### 9. **GET `/api/dashboard/risk-intelligence`** - Inteligência de Risco

**Descrição:** Análise automatizada de riscos com recomendações baseadas em IA/algoritmos.

**Response:**

```json
{
  "riskAlerts": [
    {
      "id": 1,
      "objective": {
        "id": 101,
        "title": "Aumentar receita SaaS em 25%"
      },
      "riskLevel": "high",
      "completionChance": 22,
      "confidenceLevel": 85,
      "recommendation": "Acelerar conversão de leads qualificados e revisar estratégia de pricing",
      "priority": "urgent",
      "estimatedImpact": "high",
      "factors": [
        {
          "factor": "Baixa conversão de leads",
          "impact": "high",
          "probability": 85,
          "description": "Taxa atual de 7.5% vs meta de 15%"
        },
        {
          "factor": "Concorrência acirrada",
          "impact": "medium",
          "probability": 70,
          "description": "3 novos competidores no mercado"
        },
        {
          "factor": "Sazonalidade Q4",
          "impact": "low",
          "probability": 60,
          "description": "Historicamente Q4 é mais fraco"
        }
      ],
      "suggestedActions": [
        {
          "action": "Revisar processo de vendas",
          "priority": "high",
          "estimatedEffort": "medium",
          "expectedImpact": "high"
        },
        {
          "action": "Analisar pricing strategy",
          "priority": "high",
          "estimatedEffort": "low",
          "expectedImpact": "medium"
        },
        {
          "action": "Acelerar produto MVP",
          "priority": "medium",
          "estimatedEffort": "high",
          "expectedImpact": "high"
        }
      ],
      "historicalData": {
        "lastQuarterCompletion": 68,
        "averageCompletion": 72,
        "trend": "declining"
      }
    },
    {
      "id": 2,
      "objective": {
        "id": 102,
        "title": "Implementar 5 funcionalidades AI"
      },
      "riskLevel": "medium",
      "completionChance": 65,
      "confidenceLevel": 78,
      "recommendation": "Alocar mais recursos para desenvolvimento da funcionalidade crítica",
      "priority": "medium",
      "estimatedImpact": "medium",
      "factors": [
        {
          "factor": "Complexidade técnica alta",
          "impact": "high",
          "probability": 90,
          "description": "Integração com múltiplas APIs externas"
        },
        {
          "factor": "Recursos limitados",
          "impact": "medium",
          "probability": 70,
          "description": "Apenas 2 desenvolvedores sênior"
        }
      ],
      "suggestedActions": [
        {
          "action": "Contratar desenvolvedor especialista",
          "priority": "high",
          "estimatedEffort": "high",
          "expectedImpact": "high"
        },
        {
          "action": "Reduzir escopo para funcionalidades core",
          "priority": "medium",
          "estimatedEffort": "low",
          "expectedImpact": "medium"
        }
      ],
      "historicalData": {
        "lastQuarterCompletion": 75,
        "averageCompletion": 78,
        "trend": "stable"
      }
    },
    {
      "id": 3,
      "objective": {
        "id": 103,
        "title": "Reduzir churn para 3%"
      },
      "riskLevel": "high",
      "completionChance": 18,
      "confidenceLevel": 92,
      "recommendation": "Implementar urgentemente programa de retenção e análise de feedback",
      "priority": "critical",
      "estimatedImpact": "high",
      "factors": [
        {
          "factor": "Falta de programa de retenção",
          "impact": "high",
          "probability": 95,
          "description": "Nenhuma iniciativa ativa de retenção"
        },
        {
          "factor": "Feedback negativo crescente",
          "impact": "high",
          "probability": 88,
          "description": "NPS caindo 0.3 pontos/mês"
        }
      ],
      "suggestedActions": [
        {
          "action": "Criar programa de Customer Success",
          "priority": "critical",
          "estimatedEffort": "high",
          "expectedImpact": "high"
        },
        {
          "action": "Implementar pesquisa de satisfação",
          "priority": "high",
          "estimatedEffort": "medium",
          "expectedImpact": "medium"
        }
      ],
      "historicalData": {
        "lastQuarterCompletion": 45,
        "averageCompletion": 52,
        "trend": "declining"
      }
    },
    {
      "id": 4,
      "objective": {
        "id": 104,
        "title": "NPS acima de 4.5"
      },
      "riskLevel": "low",
      "completionChance": 85,
      "confidenceLevel": 88,
      "recommendation": "Manter estratégia atual e monitorar consistentemente",
      "priority": "low",
      "estimatedImpact": "low",
      "factors": [
        {
          "factor": "Tendência positiva",
          "impact": "positive",
          "probability": 85,
          "description": "NPS crescendo 0.1 pontos/mês"
        }
      ],
      "suggestedActions": [
        {
          "action": "Manter estratégia atual",
          "priority": "low",
          "estimatedEffort": "low",
          "expectedImpact": "low"
        }
      ],
      "historicalData": {
        "lastQuarterCompletion": 88,
        "averageCompletion": 82,
        "trend": "improving"
      }
    }
  ],
  "summary": {
    "totalObjectives": 4,
    "highRisk": 2,
    "mediumRisk": 1,
    "lowRisk": 1,
    "criticalActions": 1,
    "urgentActions": 2
  }
}
```

---

### 10. **GET `/api/dashboard/filters/options`** - Opções para Filtros

**Descrição:** Opções dinâmicas para filtros do dashboard baseadas nos dados da empresa.

**Response:**

```json
{
  "quarters": [
    { "label": "Q1 2024", "value": "Q1_2024", "active": true },
    { "label": "Q2 2024", "value": "Q2_2024", "active": true },
    { "label": "Q3 2024", "value": "Q3_2024", "active": true },
    { "label": "Q4 2024", "value": "Q4_2024", "active": true },
    { "label": "Q1 2025", "value": "Q1_2025", "active": false }
  ],
  "teams": [
    { "label": "Todos", "value": "", "count": null },
    { "label": "Engineering", "value": "engineering", "count": 8 },
    { "label": "Marketing", "value": "marketing", "count": 6 },
    { "label": "Sales", "value": "sales", "count": 5 },
    { "label": "Product", "value": "product", "count": 4 },
    { "label": "Operations", "value": "operations", "count": 3 }
  ],
  "criteria": [
    { "label": "Todos", "value": "", "count": null },
    { "label": "Receita", "value": "revenue", "count": 5 },
    { "label": "Satisfação Cliente", "value": "satisfaction", "count": 3 },
    { "label": "Retenção Talentos", "value": "retention", "count": 4 },
    { "label": "Inovação", "value": "innovation", "count": 6 },
    { "label": "Sustentabilidade", "value": "sustainability", "count": 2 }
  ],
  "statuses": [
    { "label": "Todos", "value": "", "count": null },
    { "label": "No Prazo", "value": "on_track", "count": 18 },
    { "label": "Em Risco", "value": "at_risk", "count": 4 },
    { "label": "Atrasado", "value": "delayed", "count": 2 },
    { "label": "Concluído", "value": "completed", "count": 0 },
    { "label": "Crítico", "value": "critical", "count": 1 }
  ],
  "users": [
    { "label": "Ana Silva", "value": "10", "team": "Engineering" },
    { "label": "Carlos Santos", "value": "15", "team": "Sales" },
    { "label": "Marina Costa", "value": "12", "team": "Marketing" },
    { "label": "João Pereira", "value": "14", "team": "Sales" },
    { "label": "Lucia Rodrigues", "value": "16", "team": "Operations" }
  ]
}
```

---

## 🔧 Parâmetros de Query para Filtros

Todos os endpoints principais devem aceitar parâmetros de filtro via query string:

```
GET /api/dashboard/overview?quarter=Q4_2024&team=engineering&status=at_risk
GET /api/dashboard/teams?quarter=Q4_2024&criteria=revenue
GET /api/dashboard/contributors?team=engineering&limit=10&page=1
GET /api/dashboard/temporal-evolution?quarter=Q4_2024&period=weekly
GET /api/dashboard/at-risk-okrs?team=sales&status=critical
```

### **Parâmetros Suportados:**

| Parâmetro   | Tipo   | Descrição                       | Exemplo                                 |
| ----------- | ------ | ------------------------------- | --------------------------------------- |
| `quarter`   | String | Filtro por trimestre            | `Q4_2024`                               |
| `team`      | String | Filtro por time                 | `engineering`                           |
| `status`    | String | Filtro por status do OKR        | `at_risk`                               |
| `criteria`  | String | Filtro por critério de sucesso  | `revenue`                               |
| `users`     | Array  | Filtro por usuários específicos | `[10,15,12]`                            |
| `dateRange` | Object | Período personalizado           | `{start:"2024-01-01",end:"2024-12-31"}` |
| `page`      | Number | Página para paginação           | `1`                                     |
| `limit`     | Number | Limite de itens por página      | `10`                                    |
| `sort`      | String | Campo para ordenação            | `progress`                              |
| `order`     | String | Direção da ordenação            | `desc`                                  |

---

## 🎨 Status e Enums Padronizados

### **Status de OKR:**

- `on_track` - No prazo ✅
- `at_risk` - Em risco ⚠️
- `delayed` - Atrasado 🔶
- `completed` - Concluído ✅
- `critical` - Crítico 🔴

### **Níveis de Risco:**

- `low` - Baixo (0-30%)
- `medium` - Médio (31-60%)
- `high` - Alto (61-100%)

### **Status de Performance:**

- `excellent` - Excelente (90-100%)
- `good` - Bom (70-89%)
- `warning` - Atenção (50-69%)
- `danger` - Crítico (0-49%)

### **Tendências:**

- `up` - Crescimento 📈
- `down` - Declínio 📉
- `stable` - Estável ➡️

### **Tipos de Critério:**

- `quantitative` - Quantitativo (números)
- `qualitative` - Qualitativo (qualidade)

### **Frequência de Medição:**

- `daily` - Diário
- `weekly` - Semanal
- `bi-weekly` - Quinzenal
- `monthly` - Mensal
- `quarterly` - Trimestral

---

## 🚀 Implementação Sugerida

### **1. Criar Service Layer**

```typescript
// src/service/dashboard.service.ts
export class DashboardService {
  private baseUrl = '/api/dashboard';

  async getOverview(filters: DashboardFilters): Promise<DashboardOverview> {
    const params = this.buildQueryParams(filters);
    const response = await api.get(`${this.baseUrl}/overview?${params}`);
    return response.data;
  }

  async getTeamPerformance(
    filters: DashboardFilters
  ): Promise<TeamPerformanceResponse> {
    const params = this.buildQueryParams(filters);
    const response = await api.get(`${this.baseUrl}/teams?${params}`);
    return response.data;
  }

  async getTopContributors(
    filters: DashboardFilters
  ): Promise<ContributorsResponse> {
    const params = this.buildQueryParams(filters);
    const response = await api.get(`${this.baseUrl}/contributors?${params}`);
    return response.data;
  }

  async getTemporalEvolution(
    filters: DashboardFilters
  ): Promise<TemporalEvolutionResponse> {
    const params = this.buildQueryParams(filters);
    const response = await api.get(
      `${this.baseUrl}/temporal-evolution?${params}`
    );
    return response.data;
  }

  async getSuccessCriteria(
    filters: DashboardFilters
  ): Promise<SuccessCriteriaResponse> {
    const params = this.buildQueryParams(filters);
    const response = await api.get(
      `${this.baseUrl}/success-criteria?${params}`
    );
    return response.data;
  }

  async getAtRiskOkrs(filters: DashboardFilters): Promise<AtRiskOkrsResponse> {
    const params = this.buildQueryParams(filters);
    const response = await api.get(`${this.baseUrl}/at-risk-okrs?${params}`);
    return response.data;
  }

  async getRecentCheckIns(
    filters: DashboardFilters
  ): Promise<CheckInsResponse> {
    const params = this.buildQueryParams(filters);
    const response = await api.get(`${this.baseUrl}/recent-checkins?${params}`);
    return response.data;
  }

  async getMeasurementSchedule(
    filters: DashboardFilters
  ): Promise<MeasurementScheduleResponse> {
    const params = this.buildQueryParams(filters);
    const response = await api.get(
      `${this.baseUrl}/measurement-schedule?${params}`
    );
    return response.data;
  }

  async getRiskIntelligence(
    filters: DashboardFilters
  ): Promise<RiskIntelligenceResponse> {
    const params = this.buildQueryParams(filters);
    const response = await api.get(
      `${this.baseUrl}/risk-intelligence?${params}`
    );
    return response.data;
  }

  async getFilterOptions(): Promise<FilterOptionsResponse> {
    const response = await api.get(`${this.baseUrl}/filters/options`);
    return response.data;
  }

  private buildQueryParams(filters: DashboardFilters): string {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else if (typeof value === 'object') {
          params.append(key, JSON.stringify(value));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    return params.toString();
  }
}
```

### **2. Interfaces TypeScript**

```typescript
// src/types/dashboard.types.ts
export interface DashboardFilters {
  quarter?: string;
  team?: string;
  status?: string;
  criteria?: string;
  users?: number[];
  dateRange?: {
    start: string;
    end: string;
  };
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface DashboardOverview {
  quarter: string;
  year: number;
  progress: number;
  totalObjectives: number;
  onTrack: number;
  atRisk: number;
  delayed: number;
  completedKeyResults: number;
  totalKeyResults: number;
  avgTeamPerformance: number;
  trendsComparison: {
    lastQuarter: number;
    change: number;
  };
  statistics: {
    generalProgress: StatisticItem;
    completedOkrs: StatisticItem;
    engagement: StatisticItem;
    averageRisk: StatisticItem;
    averageCheckIns: number;
    weeklyProgress: number;
  };
}

export interface StatisticItem {
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  total?: number;
}

// ... outras interfaces
```

### **3. Substituir Mocks Gradualmente**

```typescript
// No Dashboard.vue, substituir os mocks por chamadas reais:

// ANTES (Mock):
const quarterData = ref({
  progress: 73,
  totalObjectives: 24
  // ... dados mockados
});

// DEPOIS (API):
const quarterData = ref<DashboardOverview | null>(null);
const dashboardService = new DashboardService();

const loadOverviewData = async () => {
  try {
    loading.value = true;
    const data = await dashboardService.getOverview(filters.value);
    quarterData.value = data;
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Falha ao carregar dados do overview'
    });
  } finally {
    loading.value = false;
  }
};

// Carregar dados quando filtros mudarem
watch(
  filters,
  () => {
    loadOverviewData();
  },
  { deep: true }
);
```

### **4. Error Handling e Loading States**

```typescript
// Estados de loading individuais
const loadingStates = ref({
  overview: false,
  teams: false,
  contributors: false,
  evolution: false,
  criteria: false,
  atRisk: false,
  checkIns: false,
  schedule: false,
  riskIntelligence: false
});

// Função genérica para carregar dados
const loadData = async <T>(
  loader: () => Promise<T>,
  setter: (data: T) => void,
  loadingKey: keyof typeof loadingStates.value,
  errorMessage: string
) => {
  try {
    loadingStates.value[loadingKey] = true;
    const data = await loader();
    setter(data);
  } catch (error) {
    console.error(`Error loading ${loadingKey}:`, error);
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: errorMessage
    });
  } finally {
    loadingStates.value[loadingKey] = false;
  }
};

// Usar para cada seção
const loadAllData = async () => {
  await Promise.all([
    loadData(
      () => dashboardService.getOverview(filters.value),
      (data) => (quarterData.value = data),
      'overview',
      'Falha ao carregar visão geral'
    ),
    loadData(
      () => dashboardService.getTeamPerformance(filters.value),
      (data) => (teamPerformance.value = data.teams),
      'teams',
      'Falha ao carregar performance dos times'
    )
    // ... outras chamadas
  ]);
};
```

---

## 📈 Priorização de Implementação

### **Fase 1 - Core (Semana 1-2)**

1. ✅ **Overview** - Visão geral do trimestre
2. ✅ **Teams** - Performance dos times
3. ✅ **Contributors** - Top contribuidores
4. ✅ **Filter Options** - Opções dos filtros

### **Fase 2 - Analytics (Semana 3-4)**

5. ✅ **Temporal Evolution** - Evolução temporal
6. ✅ **Success Criteria** - Critérios de sucesso
7. ✅ **At Risk OKRs** - OKRs em risco

### **Fase 3 - Advanced (Semana 5-6)**

8. ✅ **Recent Check-ins** - Check-ins recentes
9. ✅ **Measurement Schedule** - Agenda de medições

### **Fase 4 - AI/Intelligence (Semana 7-8)**

10. ✅ **Risk Intelligence** - Inteligência de risco

### **Fase 5 - Real-time & Optimization (Semana 9+)**

11. 🔄 **WebSocket/SSE** - Atualizações em tempo real
12. 🔄 **Caching** - Cache inteligente
13. 🔄 **Export** - Exportação de relatórios

---

## 🔒 Considerações de Segurança

1. **Autenticação**: Todos os endpoints requerem token JWT válido
2. **Autorização**: Usuários só veem dados de seus times/projetos
3. **Rate Limiting**: Limitar chamadas por usuário/IP
4. **Validação**: Validar todos os parâmetros de entrada
5. **Logs**: Registrar todas as consultas para auditoria

---

## 📊 Métricas de Performance

1. **Cache**: Implementar cache Redis para dados frequentes
2. **Paginação**: Limitar resultados grandes (máx. 100 itens)
3. **Compressão**: Usar gzip para responses grandes
4. **Índices**: Otimizar queries do banco com índices apropriados
5. **CDN**: Servir assets estáticos via CDN

---

## 🧪 Testes

```typescript
// Exemplo de teste para o service
describe('DashboardService', () => {
  it('should fetch overview data with filters', async () => {
    const filters = { quarter: 'Q4_2024', team: 'engineering' };
    const result = await dashboardService.getOverview(filters);

    expect(result).toHaveProperty('quarter', 'Q4');
    expect(result).toHaveProperty('year', 2024);
    expect(result.progress).toBeGreaterThanOrEqual(0);
    expect(result.progress).toBeLessThanOrEqual(100);
  });
});
```

---

**💡 Com essa estrutura completa, o Dashboard CEO ficará 100% dinâmico, escalável e pronto para crescer junto com as necessidades do negócio!**

**🎯 Próximo passo:** Implementar o `DashboardService` e começar substituindo os mocks pela integração real com a API.
