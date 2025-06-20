import 'dotenv/config';
import { Dialect, Sequelize } from 'sequelize';
import { logger } from '@configs/logger';

const dbUser = process.env.DB_USER as string;
const dbPassword = process.env.DB_PASSWORD as string;
const dbName = process.env.DB_NAME as string;
const host = process.env.DB_HOST as string;
const dialect = process.env.DB_DIALECT as string;

export const sequelize: Sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  dialect: dialect as Dialect,
  host,
  logging: (msg: unknown) => {
    logger.info('Sequelize SQL Log', { query: msg });
  }
});
