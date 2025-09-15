import { asyncLocalStorage } from '@configs/async.context';
import { corsMiddleware } from '@configs/cors';
import {
  notFoundHandler,
  secureErrorHandler,
  suspiciousRequestLogger
} from '@configs/error-handling';
import { logger } from '@configs/logger';
import { config as prometheusConfig } from '@configs/prometheus';
import routers from '@configs/routers';
import { helmetConfig, uploadSecurityHeaders } from '@configs/security';
import {
  healthCheckWithMetrics,
  metricsEndpoint,
  prometheusMiddleware
} from '@middlewares/prometheus.middleware';
import bodyParser from 'body-parser';
import express, { Express } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import uuid4 from 'uuid4';

const app: Express = express();

// Configurar trust proxy para funcionar atrás do Nginx
//app.set('trust proxy', true);

// 1. Middleware de segurança - aplicados primeiro
app.use(helmetConfig);
// app.use(globalLimiter);
app.use(mongoSanitize());
app.use(suspiciousRequestLogger);

// 2. Middleware para gerar e armazenar o requestId
app.use((req, res, next) => {
  const requestId = uuid4();
  asyncLocalStorage.run({ requestId }, () => {
    logger.info(`Incoming request: ${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    next();
  });
});

// 3. Prometheus metrics middleware (se habilitado)
if (prometheusConfig.enabled) {
  app.use(prometheusMiddleware());
  logger.info(`Prometheus metrics enabled on ${prometheusConfig.endpoint}`);
}

// 4. CORS
app.use(corsMiddleware);

// 5. Body parsing
app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));

// 6. Endpoints específicos do Prometheus
if (prometheusConfig.enabled) {
  app.get(prometheusConfig.endpoint, metricsEndpoint());
  app.get('/health', healthCheckWithMetrics());
  logger.info(`Metrics endpoint available at ${prometheusConfig.endpoint}`);
}

// 7. Static files com headers de segurança e CORS específico
app.use(
  '/uploads',
  corsMiddleware,
  uploadSecurityHeaders,
  express.static('uploads', {
    setHeaders: (res, path) => {
      // Headers adicionais para imagens
      if (
        path.endsWith('.jpg') ||
        path.endsWith('.jpeg') ||
        path.endsWith('.png') ||
        path.endsWith('.webp')
      ) {
        res.setHeader('Content-Type', 'image/' + path.split('.').pop());
      }
    }
  })
);

// 8. Routes
app.use(routers);

// 9. Error handling - aplicados por último
app.use(notFoundHandler);
app.use(secureErrorHandler);

export default app;
