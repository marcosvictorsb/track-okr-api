import { recordError, recordHttpRequest } from '@configs/prometheus';
import { NextFunction, Request, Response } from 'express';

/**
 * Middleware para capturar métricas do Prometheus
 * Registra automaticamente todas as requisições HTTP
 */

interface MetricsRequest extends Request {
  startTime?: number;
  requestSize?: number;
}

export function prometheusMiddleware() {
  return (req: MetricsRequest, res: Response, next: NextFunction) => {
    // Marcar início da requisição
    req.startTime = Date.now();

    // Capturar tamanho da requisição
    req.requestSize = parseInt(req.get('content-length') || '0', 10);

    // Hook para capturar métricas quando a resposta terminar
    const originalSend = res.send;
    const originalJson = res.json;

    res.send = function (data) {
      recordMetrics();
      return originalSend.call(this, data);
    };

    res.json = function (data) {
      recordMetrics();
      return originalJson.call(this, data);
    };

    // Função para registrar métricas
    function recordMetrics() {
      if (!req.startTime) return;

      const duration = (Date.now() - req.startTime!) / 1000; // em segundos
      const route = getRoutePattern(req);
      const method = req.method;
      const statusCode = res.statusCode;

      // Estimar tamanho da resposta
      const responseSize =
        parseInt(res.get('content-length') || '0', 10) ||
        (res.getHeader('content-length') as number) ||
        estimateResponseSize(res);

      // Registrar métricas da requisição
      recordHttpRequest(
        method,
        route,
        statusCode,
        duration,
        req.requestSize,
        responseSize
      );

      // Registrar erros se status >= 400
      if (statusCode >= 400) {
        const errorType = getErrorType(statusCode);
        recordError(errorType);
      }
    }

    // Capturar erros não tratados
    res.on('error', (error) => {
      recordError('response_error');
      console.error('Response error:', error);
    });

    next();
  };
}

/**
 * Obtém o padrão da rota para métricas
 */
function getRoutePattern(req: Request): string {
  // Tentar obter a rota do Express
  if (req.route && req.route.path) {
    return req.baseUrl + req.route.path;
  }

  // Tentar obter da stack de middlewares
  if (req.baseUrl) {
    return req.baseUrl + req.path;
  }

  // Fallback para URL original normalizada
  return req.originalUrl || req.url || 'unknown';
}

/**
 * Estima o tamanho da resposta baseado no conteúdo
 */
function estimateResponseSize(res: Response): number {
  const contentLength = res.get('content-length');
  if (contentLength) {
    return parseInt(contentLength, 10);
  }

  // Estimativa baseada no tipo de conteúdo
  const contentType = res.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return 500; // Estimativa para JSON médio
  } else if (contentType.includes('text/html')) {
    return 2000; // Estimativa para HTML
  } else if (contentType.includes('text/plain')) {
    return 200; // Estimativa para texto
  }

  return 0;
}

/**
 * Determina o tipo de erro baseado no status code
 */
function getErrorType(statusCode: number): string {
  if (statusCode >= 400 && statusCode < 500) {
    switch (statusCode) {
      case 400:
        return 'bad_request';
      case 401:
        return 'unauthorized';
      case 403:
        return 'forbidden';
      case 404:
        return 'not_found';
      case 422:
        return 'validation_error';
      case 429:
        return 'rate_limit';
      default:
        return 'client_error';
    }
  } else if (statusCode >= 500) {
    switch (statusCode) {
      case 500:
        return 'internal_server_error';
      case 502:
        return 'bad_gateway';
      case 503:
        return 'service_unavailable';
      case 504:
        return 'gateway_timeout';
      default:
        return 'server_error';
    }
  }

  return 'unknown_error';
}

/**
 * Middleware para endpoint de métricas
 */
export function metricsEndpoint() {
  return async (req: Request, res: Response) => {
    try {
      const { register } = await import('@configs/prometheus');

      res.set('Content-Type', register.contentType);
      const metrics = await register.metrics();
      res.end(metrics);
    } catch (error) {
      console.error('Error generating metrics:', error);
      res.set('Content-Type', 'text/plain');
      res.status(500).end('# ERROR Failed to generate metrics\n');
    }
  };
}

/**
 * Middleware para health check com métricas básicas
 */
export function healthCheckWithMetrics() {
  return async (req: Request, res: Response) => {
    try {
      const { environment, config } = await import('@configs/prometheus');

      const healthInfo = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment,
        metrics: {
          enabled: config.enabled,
          endpoint: config.endpoint,
          port: config.port
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      };

      res.json(healthInfo);
    } catch (error) {
      console.error('Error in health check:', error);
      res.status(500).json({
        status: 'error',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  };
}

export default {
  prometheusMiddleware,
  metricsEndpoint,
  healthCheckWithMetrics
};
