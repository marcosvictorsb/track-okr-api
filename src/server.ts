import { logger } from '@configs/logger';
import 'dotenv/config';
import app from './app';

const PORT: number | string = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`SERVER RUNNING ON PORT ${PORT}`);
});

// Capturar sinais de encerramento gracioso
process.on('SIGINT', () => {
  logger.info('Recebido SIGINT. Encerrando o servidor...');
  server.close(() => {
    logger.info('Servidor encerrado com sucesso.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  logger.info('Recebido SIGTERM. Encerrando o servidor...');
  server.close(() => {
    logger.info('Servidor encerrado com sucesso.');
    process.exit(0);
  });
});
