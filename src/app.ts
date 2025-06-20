import express, { Express } from 'express';
import bodyParser from 'body-parser';
import { corsMiddleware } from '@configs/cors';
import routers from '@configs/routers';
import { logger } from '@configs/logger';
import { asyncLocalStorage } from '@configs/async.context';
import uuid4 from 'uuid4';

const app: Express = express();

// Middleware para gerar e armazenar o requestId
app.use((req, res, next) => {
  const requestId = uuid4();
  asyncLocalStorage.run({ requestId }, () => {
    logger.info(`Incoming request: ${req.method} ${req.path}`);
    next();
  });
});

app.use(corsMiddleware);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(routers);

export default app;
