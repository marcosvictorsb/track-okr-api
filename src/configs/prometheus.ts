import promClient from 'prom-client';

const environment = process.env.NODE_ENV || 'development';
const appName = `GUNNO_${environment}`;
const appDisplayName = `GUNNO - ${environment}`;

const register = new promClient.Registry();

promClient.collectDefaultMetrics({
  register,
  prefix: `${appName}_`,
  gcDurationBuckets: [0.01, 0.1, 1, 5],
  eventLoopMonitoringPrecision: 100
});

register.setDefaultLabels({
  app: appDisplayName,
  service: appName,
  environment: environment,
  version: process.env.npm_package_version || '1.0.0'
});

const httpRequestsTotal = new promClient.Counter({
  name: `${appName}_http_requests_total`,
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'environment'],
  registers: [register]
});

const httpRequestDuration = new promClient.Histogram({
  name: `${appName}_http_request_duration_seconds`,
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code', 'environment'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register]
});

const httpRequestSize = new promClient.Histogram({
  name: `${appName}_http_request_size_bytes`,
  help: 'HTTP request size in bytes',
  labelNames: ['method', 'route', 'environment'],
  buckets: [100, 1000, 10000, 100000, 1000000],
  registers: [register]
});

const httpResponseSize = new promClient.Histogram({
  name: `${appName}_http_response_size_bytes`,
  help: 'HTTP response size in bytes',
  labelNames: ['method', 'route', 'status_code', 'environment'],
  buckets: [100, 1000, 10000, 100000, 1000000],
  registers: [register]
});

const dbConnectionsActive = new promClient.Gauge({
  name: `${appName}_database_connections_active`,
  help: 'Number of active database connections',
  labelNames: ['database', 'environment'],
  registers: [register]
});

const dbQueryDuration = new promClient.Histogram({
  name: `${appName}_database_query_duration_seconds`,
  help: 'Database query duration in seconds',
  labelNames: ['operation', 'table', 'environment'],
  buckets: [0.001, 0.01, 0.1, 1, 5],
  registers: [register]
});

const errorsTotal = new promClient.Counter({
  name: `${appName}_errors_total`,
  help: 'Total number of errors by type',
  labelNames: ['error_type', 'environment'],
  registers: [register]
});

const activeUsers = new promClient.Gauge({
  name: `${appName}_active_users`,
  help: 'Number of active users',
  labelNames: ['environment'],
  registers: [register]
});

const cacheOperations = new promClient.Counter({
  name: `${appName}_cache_operations_total`,
  help: 'Total cache operations',
  labelNames: ['operation', 'result', 'environment'],
  registers: [register]
});

const fileUploads = new promClient.Counter({
  name: `${appName}_file_uploads_total`,
  help: 'Total number of file uploads',
  labelNames: ['file_type', 'status', 'environment'],
  registers: [register]
});

const fileUploadSize = new promClient.Histogram({
  name: `${appName}_file_upload_size_bytes`,
  help: 'File upload size in bytes',
  labelNames: ['file_type', 'environment'],
  buckets: [1024, 10240, 102400, 1048576, 10485760],
  registers: [register]
});

const authAttempts = new promClient.Counter({
  name: `${appName}_auth_attempts_total`,
  help: 'Total authentication attempts',
  labelNames: ['method', 'result', 'environment'],
  registers: [register]
});

/**
 * Normaliza o nome da rota para métricas
 */
function normalizeRoute(route) {
  if (!route) return 'unknown';

  return route
    .replace(/\/\d+/g, '/:id')
    .replace(
      /\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi,
      '/:uuid'
    )
    .replace(/\/[a-f0-9]{24}/g, '/:objectId');
}

/**
 * Registra métricas de requisição HTTP
 */
function recordHttpRequest(
  method,
  route,
  statusCode,
  duration,
  requestSize,
  responseSize
) {
  const normalizedRoute = normalizeRoute(route);
  const labels = {
    method: method.toUpperCase(),
    route: normalizedRoute,
    status_code: statusCode.toString(),
    environment
  };

  httpRequestsTotal.inc(labels);
  httpRequestDuration.observe(labels, duration);

  if (requestSize) {
    httpRequestSize.observe(
      {
        method: method.toUpperCase(),
        route: normalizedRoute,
        environment
      },
      requestSize
    );
  }

  if (responseSize) {
    httpResponseSize.observe(labels, responseSize);
  }
}

/**
 * Registra métricas de banco de dados
 */
function recordDatabaseQuery(operation, table, duration) {
  dbQueryDuration.observe(
    {
      operation,
      table,
      environment
    },
    duration
  );
}

/**
 * Registra erro
 */
function recordError(errorType) {
  errorsTotal.inc({
    error_type: errorType,
    environment
  });
}

/**
 * Atualiza número de conexões ativas do banco
 */
function updateDatabaseConnections(database, count) {
  dbConnectionsActive.set(
    {
      database,
      environment
    },
    count
  );
}

/**
 * Atualiza número de usuários ativos
 */
function updateActiveUsers(count) {
  activeUsers.set({ environment }, count);
}

/**
 * Registra operação de cache
 */
function recordCacheOperation(operation, result) {
  cacheOperations.inc({
    operation,
    result,
    environment
  });
}

/**
 * Registra upload de arquivo
 */
function recordFileUpload(fileType, status, size) {
  fileUploads.inc({
    file_type: fileType,
    status,
    environment
  });

  if (size) {
    fileUploadSize.observe(
      {
        file_type: fileType,
        environment
      },
      size
    );
  }
}

/**
 * Registra tentativa de autenticação
 */
function recordAuthAttempt(method, result) {
  authAttempts.inc({
    method,
    result,
    environment
  });
}

const metricsConfig = {
  development: {
    enabled: true,
    endpoint: '/metrics',
    port: process.env.METRICS_PORT || 9090,
    collectDefaultMetrics: true,
    collectInterval: 5000
  },
  production: {
    enabled: true,
    endpoint: '/metrics',
    port: process.env.METRICS_PORT || 9090,
    collectDefaultMetrics: true,
    collectInterval: 30000
  },
  demo: {
    enabled: true,
    endpoint: '/metrics',
    port: process.env.METRICS_PORT || 9090,
    collectDefaultMetrics: true,
    collectInterval: 5000
  },
  test: {
    enabled: false,
    endpoint: '/metrics',
    port: 9091,
    collectDefaultMetrics: false,
    collectInterval: 0
  }
};

const currentConfig = metricsConfig[environment] || metricsConfig.development;

export {
  activeUsers,
  authAttempts,
  cacheOperations,
  currentConfig as config,
  dbConnectionsActive,
  dbQueryDuration,
  environment,
  errorsTotal,
  fileUploads,
  fileUploadSize,
  httpRequestDuration,
  httpRequestSize,
  httpRequestsTotal,
  httpResponseSize,
  normalizeRoute,
  recordAuthAttempt,
  recordCacheOperation,
  recordDatabaseQuery,
  recordError,
  recordFileUpload,
  recordHttpRequest,
  register,
  updateActiveUsers,
  updateDatabaseConnections
};

export default {
  register,
  config: currentConfig,
  environment,
  metrics: {
    httpRequestsTotal,
    httpRequestDuration,
    httpRequestSize,
    httpResponseSize,
    dbConnectionsActive,
    dbQueryDuration,
    errorsTotal,
    activeUsers,
    cacheOperations,
    fileUploads,
    fileUploadSize,
    authAttempts
  },
  helpers: {
    normalizeRoute,
    recordHttpRequest,
    recordDatabaseQuery,
    recordError,
    updateDatabaseConnections,
    updateActiveUsers,
    recordCacheOperation,
    recordFileUpload,
    recordAuthAttempt
  }
};
