import { Sequelize } from 'sequelize';

const dbUser = process.env.DB_USER || 'user';
const dbPassword = process.env.DB_PASSWORD || 'password';
const dbName = process.env.DB_NAME || 'name';
const host = process.env.DB_HOST || 'localhost';
const dialect = 'mysql';

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  dialect,
  host
});

module.exports = sequelize;
