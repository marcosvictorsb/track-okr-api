import { recordError, recordHttpRequest } from '@configs/prometheus';
import { NextFunction, Request, Response } from 'express';

interface MetricsRequest extends Request {
  startTime?: number;
  requestSize?: number;
}

export function prometheusMiddleware() {
  return (req: MetricsRequest, res: Response, next: NextFunction) => {
    req.startTime = Date.now();

    req.requestSize = parseInt(req.get('content-length') || '0', 10);

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

    function recordMetrics() {
      if (!req.startTime) return;

      const duration = (Date.now() - req.startTime!) / 1000;
      const route = getRoutePattern(req);
      const method = req.method;
      const statusCode = res.statusCode;

      const responseSize =
        parseInt(res.get('content-length') || '0', 10) ||
        (res.getHeader('content-length') as number) ||
        estimateResponseSize(res);

      recordHttpRequest(
        method,
        route,
        statusCode,
        duration,
        req.requestSize,
        responseSize
      );

      if (statusCode >= 400) {
        const errorType = getErrorType(statusCode);
        recordError(errorType);
      }
    }

    res.on('error', (error) => {
      recordError('response_error');
      console.error('Response error:', error);
    });

    next();
  };
}

function getRoutePattern(req: Request): string {
  if (req.route && req.route.path) {
    return req.baseUrl + req.route.path;
  }

  if (req.baseUrl) {
    return req.baseUrl + req.path;
  }

  return req.originalUrl || req.url || 'unknown';
}

function estimateResponseSize(res: Response): number {
  const contentLength = res.get('content-length');
  if (contentLength) {
    return parseInt(contentLength, 10);
  }

  const contentType = res.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return 500;
  } else if (contentType.includes('text/html')) {
    return 2000;
  } else if (contentType.includes('text/plain')) {
    return 200;
  }

  return 0;
}

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
