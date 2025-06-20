import express, { Express } from 'express';
import bodyParser from 'body-parser';
import { corsMiddleware } from '@configs/cors';
import routers from '@configs/routers';

const app: Express = express();

app.use(corsMiddleware);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(routers);

export default app;
