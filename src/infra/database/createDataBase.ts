import 'dotenv/config';
import mysql from 'mysql2/promise';

interface DbConfig {
  host: string;
  user: string;
  password: string;
  database?: string;
}

async function createDatabase(): Promise<void> {
  const config: DbConfig = {
    host: process.env.DB_HOST as string,
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string
  };

  const connection = await mysql.createConnection(config);

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`
    );
    console.log('Banco de dados criado ou já existente');
  } catch (error) {
    console.error('Erro ao criar o banco de dados:', error);
  } finally {
    await connection.end();
  }
}

createDatabase();
