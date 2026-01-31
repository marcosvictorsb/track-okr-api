import { Sequelize } from 'sequelize';

const dbUser = process.env.DB_USER as string;
const dbPassword = process.env.DB_PASSWORD as string;
const dbName = process.env.DB_NAME as string;
const host = process.env.DB_HOST as string;
const dialect = 'mysql';

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  dialect,
  host
});

module.exports = sequelize;
