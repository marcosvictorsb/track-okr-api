import { MemoryOptimizationService } from '@adapters/services';
import { logger } from '@configs/logger';
import 'dotenv/config';
import app from './app';

const PORT: number | string = process.env.PORT || 3000;

// Inicializar serviço de otimização de memória
const memoryService = new MemoryOptimizationService();

const server = app.listen(PORT, () => {
  logger.info(`SERVER RUNNING ON PORT ${PORT}`);

  // Iniciar otimização de memória em produção
  if (process.env.NODE_ENV === 'production') {
    memoryService.startMemoryOptimization();

    // Log inicial da memória
    const initialStats = memoryService.getMemoryStats();
    logger.info(
      'Servidor iniciado - Estatísticas iniciais de memória',
      initialStats
    );
  }
});

// Capturar sinais de encerramento gracioso
process.on('SIGINT', () => {
  logger.info('Recebido SIGINT. Encerrando o servidor...');
  memoryService.stopMemoryOptimization();
  server.close(() => {
    logger.info('Servidor encerrado com sucesso.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  logger.info('Recebido SIGTERM. Encerrando o servidor...');
  memoryService.stopMemoryOptimization();
  server.close(() => {
    logger.info('Servidor encerrado com sucesso.');
    process.exit(0);
  });
});
