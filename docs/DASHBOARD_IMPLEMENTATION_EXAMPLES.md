# Dashboard Implementation Examples

Este documento contém exemplos práticos de implementação das APIs do dashboard.

## Exemplos de Consultas SQL

### 1. Dashboard Executivo - Métricas Gerais

```sql
-- Total de empresas ativas
SELECT COUNT(*) as total_companies
FROM companies
WHERE deleted_at IS NULL;

-- Crescimento mensal de usuários
SELECT
  COUNT(*) as users_this_month
FROM users
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
  AND deleted_at IS NULL;

-- Taxa de conversão de leads
SELECT
  COUNT(*) as total_leads,
  SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) as converted_leads,
  (SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as conversion_rate
FROM landing_page_leads
WHERE deleted_at IS NULL;
```

### 2. Dashboard de OKRs - Performance

```sql
-- Objetivos por status
SELECT
  status,
  COUNT(*) as count,
  (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM objectives WHERE deleted_at IS NULL)) as percentage
FROM objectives
WHERE deleted_at IS NULL
  AND quarter = QUARTER(CURDATE())
  AND year = YEAR(CURDATE())
GROUP BY status;

-- Progress médio das chaves de resultado
SELECT
  AVG((current_value - initial_value) / (target_value - initial_value) * 100) as average_progress
FROM result_keys
WHERE deleted_at IS NULL
  AND target_value != initial_value
  AND status = 'active';

-- Top teams por performance
SELECT
  t.id,
  t.name,
  COUNT(o.id) as objectives_count,
  AVG(CASE
    WHEN o.status = 'completed' THEN 100
    ELSE (SELECT AVG((rk.current_value - rk.initial_value) / (rk.target_value - rk.initial_value) * 100)
          FROM result_keys rk WHERE rk.id_okr = o.id AND rk.deleted_at IS NULL)
  END) as completion_rate
FROM teams t
LEFT JOIN objectives o ON t.id = o.id_team AND o.deleted_at IS NULL
WHERE t.deleted_at IS NULL
GROUP BY t.id, t.name
ORDER BY completion_rate DESC
LIMIT 5;
```

### 3. Dashboard de Leads - Análise de Conversão

```sql
-- Leads por fonte e taxa de conversão
SELECT
  source,
  COUNT(*) as total_leads,
  SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) as converted,
  (SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as conversion_rate
FROM landing_page_leads
WHERE deleted_at IS NULL
GROUP BY source
ORDER BY conversion_rate DESC;

-- Timeline de leads (últimos 30 dias)
SELECT
  DATE(created_at) as date,
  COUNT(*) as new_leads,
  SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) as conversions
FROM landing_page_leads
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  AND deleted_at IS NULL
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Exemplos de Implementação dos Controllers

### 1. Executive Dashboard Controller

```typescript
// src/domains/api/dashboard/controllers/executive-dashboard.controller.ts
import { Request, Response } from 'express';
import { DashboardDataService } from '../services/dashboard-data.service';

export class ExecutiveDashboardController {
  private dashboardService: DashboardDataService;

  constructor() {
    this.dashboardService = new DashboardDataService();
  }

  async getExecutiveDashboard(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.dashboardService.getExecutiveMetrics();

      return res.json({
        success: true,
        data
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados do dashboard executivo'
      });
    }
  }
}
```

### 2. Dashboard Data Service

```typescript
// src/domains/api/dashboard/services/dashboard-data.service.ts
import { sequelize } from '@infra/database/connection/mysql';
import { QueryTypes } from 'sequelize';

export class DashboardDataService {
  async getExecutiveMetrics() {
    const [overview] = await Promise.all([
      this.getOverviewMetrics(),
      this.getGrowthMetrics(),
      this.getSubscriptionMetrics(),
      this.getActivityMetrics()
    ]);

    return {
      overview,
      growth: await this.getGrowthMetrics(),
      subscriptions: await this.getSubscriptionMetrics(),
      activity: await this.getActivityMetrics()
    };
  }

  private async getOverviewMetrics() {
    const [result] = await sequelize.query(
      `
      SELECT 
        (SELECT COUNT(*) FROM companies WHERE deleted_at IS NULL) as total_companies,
        (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as total_users,
        (SELECT COUNT(*) FROM teams WHERE deleted_at IS NULL) as total_teams,
        (SELECT COUNT(*) FROM objectives WHERE deleted_at IS NULL) as total_objectives,
        (SELECT COUNT(*) FROM result_keys WHERE deleted_at IS NULL) as total_result_keys,
        (SELECT COUNT(*) FROM landing_page_leads WHERE deleted_at IS NULL) as total_leads
    `,
      { type: QueryTypes.SELECT }
    );

    return result;
  }

  private async getGrowthMetrics() {
    const [result] = await sequelize.query(
      `
      SELECT 
        (SELECT COUNT(*) FROM companies 
         WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) 
         AND deleted_at IS NULL) as companies_this_month,
        (SELECT COUNT(*) FROM users 
         WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) 
         AND deleted_at IS NULL) as users_this_month,
        (SELECT COUNT(*) FROM objectives 
         WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) 
         AND deleted_at IS NULL) as objectives_this_month,
        (SELECT COUNT(*) FROM landing_page_leads 
         WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) 
         AND deleted_at IS NULL) as leads_this_month
    `,
      { type: QueryTypes.SELECT }
    );

    return result;
  }

  async getOKRsMetrics(filters: {
    company_id?: number;
    quarter?: number;
    year?: number;
  }) {
    let whereClause = 'WHERE o.deleted_at IS NULL';
    const replacements: any = {};

    if (filters.company_id) {
      whereClause += ' AND o.id_company = :company_id';
      replacements.company_id = filters.company_id;
    }

    if (filters.quarter) {
      whereClause += ' AND o.quarter = :quarter';
      replacements.quarter = filters.quarter;
    }

    if (filters.year) {
      whereClause += ' AND o.year = :year';
      replacements.year = filters.year;
    }

    const objectivesSummary = await sequelize.query(
      `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        (SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as completion_rate
      FROM objectives o
      ${whereClause}
    `,
      {
        type: QueryTypes.SELECT,
        replacements
      }
    );

    return { objectives_summary: objectivesSummary[0] };
  }

  async getLeadsMetrics(filters: {
    start_date?: string;
    end_date?: string;
    source?: string;
  }) {
    let whereClause = 'WHERE deleted_at IS NULL';
    const replacements: any = {};

    if (filters.start_date) {
      whereClause += ' AND created_at >= :start_date';
      replacements.start_date = filters.start_date;
    }

    if (filters.end_date) {
      whereClause += ' AND created_at <= :end_date';
      replacements.end_date = filters.end_date;
    }

    if (filters.source) {
      whereClause += ' AND source = :source';
      replacements.source = filters.source;
    }

    const overview = await sequelize.query(
      `
      SELECT 
        COUNT(*) as total_leads,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_leads,
        SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as contacted_leads,
        SUM(CASE WHEN status = 'qualified' THEN 1 ELSE 0 END) as qualified_leads,
        SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) as converted_leads,
        (SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as conversion_rate
      FROM landing_page_leads 
      ${whereClause}
    `,
      {
        type: QueryTypes.SELECT,
        replacements
      }
    );

    const leadsBySource = await sequelize.query(
      `
      SELECT 
        source,
        COUNT(*) as count,
        (SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as conversion_rate
      FROM landing_page_leads 
      ${whereClause}
      GROUP BY source
      ORDER BY conversion_rate DESC
    `,
      {
        type: QueryTypes.SELECT,
        replacements
      }
    );

    return {
      overview: overview[0],
      leads_by_source: leadsBySource
    };
  }
}
```

### 3. Router Implementation

```typescript
// src/domains/api/dashboard/routers/index.ts
import { Router } from 'express';
import { ExecutiveDashboardController } from '../controllers/executive-dashboard.controller';
import { OKRsDashboardController } from '../controllers/okrs-dashboard.controller';
import { LeadsDashboardController } from '../controllers/leads-dashboard.controller';
import { authJWTMiddleware } from '@middlewares/auth.jwt.middlewares';

const router = Router();

const executiveController = new ExecutiveDashboardController();
const okrsController = new OKRsDashboardController();
const leadsController = new LeadsDashboardController();

// Aplicar autenticação em todas as rotas
router.use(authJWTMiddleware);

// Dashboard Executivo
router.get('/executive', (req, res) =>
  executiveController.getExecutiveDashboard(req, res)
);

// Dashboard de OKRs
router.get('/okrs', (req, res) => okrsController.getOKRsDashboard(req, res));

// Dashboard de Leads
router.get('/leads', (req, res) => leadsController.getLeadsDashboard(req, res));

// Dashboard específico da empresa
router.get('/company/:company_id', (req, res) =>
  executiveController.getCompanyDashboard(req, res)
);

export default router;
```

## Cache Strategy

### Redis Cache Implementation

```typescript
// src/adapters/services/cache.service.ts
import Redis from 'ioredis';

export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  // Invalidar cache relacionado a uma empresa
  async invalidateCompanyCache(companyId: number): Promise<void> {
    const pattern = `dashboard:company:${companyId}:*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

### Cached Dashboard Service

```typescript
// Exemplo de uso do cache
export class CachedDashboardService extends DashboardDataService {
  private cache: CacheService;

  constructor() {
    super();
    this.cache = new CacheService();
  }

  async getExecutiveMetrics() {
    const cacheKey = 'dashboard:executive:overview';

    let data = await this.cache.get(cacheKey);
    if (!data) {
      data = await super.getExecutiveMetrics();
      await this.cache.set(cacheKey, data, 300); // 5 minutos
    }

    return data;
  }

  async getCompanyMetrics(companyId: number) {
    const cacheKey = `dashboard:company:${companyId}:metrics`;

    let data = await this.cache.get(cacheKey);
    if (!data) {
      data = await super.getCompanySpecificMetrics(companyId);
      await this.cache.set(cacheKey, data, 600); // 10 minutos
    }

    return data;
  }
}
```

## Performance Considerations

### 1. Database Indexes

```sql
-- Índices sugeridos para otimização
CREATE INDEX idx_objectives_company_quarter_year ON objectives(id_company, quarter, year);
CREATE INDEX idx_result_keys_objective ON result_keys(id_okr);
CREATE INDEX idx_leads_created_status ON landing_page_leads(created_at, status);
CREATE INDEX idx_users_company_created ON users(id_company, created_at);
```

### 2. Query Optimization

- Use EXPLAIN para analisar queries
- Implemente paginação para listas grandes
- Use agregações no banco ao invés de processar no aplicativo
- Considere materialized views para cálculos complexos

### 3. Monitoring

```typescript
// Middleware para monitorar performance
export const dashboardPerformanceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('Dashboard API Performance', {
      endpoint: req.path,
      method: req.method,
      duration,
      status: res.statusCode
    });
  });

  next();
};
```
