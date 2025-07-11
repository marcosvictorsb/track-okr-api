import express, { Express } from 'express';
import bodyParser from 'body-parser';
import mongoSanitize from 'express-mongo-sanitize';
import { corsMiddleware } from '@configs/cors';
import { helmetConfig, uploadSecurityHeaders } from '@configs/security';
import { globalLimiter } from '@configs/rate-limit';
import {
  secureErrorHandler,
  notFoundHandler,
  suspiciousRequestLogger
} from '@configs/error-handling';
import routers from '@configs/routers';
import { logger } from '@configs/logger';
import { asyncLocalStorage } from '@configs/async.context';
import uuid4 from 'uuid4';

const app: Express = express();

// 1. Middleware de segurança - aplicados primeiro
app.use(helmetConfig);
app.use(globalLimiter);
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

// 3. CORS
app.use(corsMiddleware);

// 4. Body parsing
app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));

// 5. Static files com headers de segurança
app.use('/uploads', uploadSecurityHeaders, express.static('uploads'));

// 6. Routes
app.use(routers);

// 7. Error handling - aplicados por último
app.use(notFoundHandler);
app.use(secureErrorHandler);

export default app;
