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
import {
  requestLoggingMiddleware,
  userContextMiddleware
} from '@middlewares/request-logging.middleware';
import bodyParser from 'body-parser';
import express, { Express } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import heapDumpRouter from './debug/heapdump.routes';

const app: Express = express();

// Configurar trust proxy para funcionar atrás do Nginx
//app.set('trust proxy', true);

// 1. Middleware de segurança - aplicados primeiro
app.use(helmetConfig);
// app.use(globalLimiter);
app.use(mongoSanitize());
app.use(suspiciousRequestLogger);

// 3. Prometheus metrics middleware (se habilitado)
// 6. Endpoints específicos do Prometheus

if (prometheusConfig.enabled) {
  app.use(prometheusMiddleware());
  logger.info(`Prometheus metrics enabled on ${prometheusConfig.endpoint}`);
}

// 2. Middleware avançado de logging que captura todas as informações da requisição
app.use(requestLoggingMiddleware());

if (prometheusConfig.enabled) {
  app.get(prometheusConfig.endpoint, metricsEndpoint());
  app.get('/health', healthCheckWithMetrics());
  logger.info(`Metrics endpoint available at ${prometheusConfig.endpoint}`);
}

// 4. CORS
app.use(corsMiddleware);

// 5. Body parsing
app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));

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

// 8. Middleware para capturar contexto do usuário autenticado
app.use(userContextMiddleware());

// 9. Routes
app.use('/debug', heapDumpRouter);
app.use(routers);

// 10. Error handling - aplicados por último
app.use(notFoundHandler);
app.use(secureErrorHandler);

export default app;
