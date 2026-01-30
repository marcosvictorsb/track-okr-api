import { logger } from '@configs/logger';
import v8 from 'v8';

export class MemoryOptimizationService {
  private gcInterval: NodeJS.Timeout | null = null;
  private memoryCheckInterval: NodeJS.Timeout | null = null;
  private isGCAvailable: boolean;

  constructor() {
    this.isGCAvailable = typeof global.gc === 'function';

    if (!this.isGCAvailable) {
      logger.warn(
        'Garbage collection não está disponível. Inicie o Node.js com --expose-gc para melhor controle de memória'
      );
    }
  }

  public startMemoryOptimization(): void {
    this.gcInterval = setInterval(
      () => {
        this.forceGarbageCollection();
      },
      30 * 60 * 1000 // 30 minutos
    );

    this.memoryCheckInterval = setInterval(
      () => {
        this.checkMemoryUsage();
      },
      5 * 60 * 1000 // 5 minutos
    );

    logger.info('Serviço de otimização de memória iniciado', {
      gc_available: this.isGCAvailable,
      gc_interval: '30 minutos',
      memory_check_interval: '5 minutos'
    });
  }

  public stopMemoryOptimization(): void {
    if (this.gcInterval) {
      clearInterval(this.gcInterval);
      this.gcInterval = null;
    }

    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
      this.memoryCheckInterval = null;
    }

    logger.info('Serviço de otimização de memória parado');
  }

  public forceGarbageCollection(): void {
    try {
      const beforeGC = process.memoryUsage();

      if (this.isGCAvailable) {
        global.gc!();
        const afterGC = process.memoryUsage();
        const freedMB = Math.round(
          (beforeGC.heapUsed - afterGC.heapUsed) / 1024 / 1024
        );

        logger.info('Garbage collection executado', {
          freed_memory_mb: freedMB,
          heap_before_mb: Math.round(beforeGC.heapUsed / 1024 / 1024),
          heap_after_mb: Math.round(afterGC.heapUsed / 1024 / 1024),
          heap_usage_percent: Math.round(
            (afterGC.heapUsed / afterGC.heapTotal) * 100
          )
        });
      }
    } catch (error) {
      logger.error('Erro ao executar garbage collection', {
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  public checkMemoryUsage(): void {
    try {
      const memUsage = process.memoryUsage();
      const heapStats = v8.getHeapStatistics();

      const heapUsagePercent = Math.round(
        (memUsage.heapUsed / heapStats.heap_size_limit) * 100
      );

      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      const heapLimitMB = Math.round(heapStats.heap_size_limit / 1024 / 1024);
      const rssMB = Math.round(memUsage.rss / 1024 / 1024);
      const externalMB = Math.round(memUsage.external / 1024 / 1024);
      const arrayBuffersMB = Math.round(memUsage.arrayBuffers / 1024 / 1024);

      logger.info('Monitoramento de memória', {
        heap_used_mb: heapUsedMB,
        heap_total_mb: heapTotalMB,
        heap_limit_mb: heapLimitMB,
        heap_usage_percent: heapUsagePercent,
        rss_mb: rssMB,
        external_mb: externalMB,
        array_buffers_mb: arrayBuffersMB,
        uptime_minutes: Math.round(process.uptime() / 60),
        total_available_size_mb: Math.round(
          heapStats.total_available_size / 1024 / 1024
        ),
        total_physical_size_mb: Math.round(
          heapStats.total_physical_size / 1024 / 1024
        )
      });

      // Alertas baseados no uso de memória
      if (heapUsagePercent > 85) {
        logger.warn('Uso de memória heap crítico', {
          heap_usage_percent: heapUsagePercent,
          heap_used_mb: heapUsedMB,
          heap_limit_mb: heapLimitMB,
          recommendation:
            'Considere reiniciar a aplicação ou investigar vazamentos de memória'
        });

        // Forçar GC se disponível
        if (this.isGCAvailable) {
          this.forceGarbageCollection();
        }
      } else if (heapUsagePercent > 70) {
        logger.warn('Uso de memória heap alto', {
          heap_usage_percent: heapUsagePercent,
          heap_used_mb: heapUsedMB,
          heap_limit_mb: heapLimitMB,
          recommendation:
            'Monitore o crescimento da memória e verifique possíveis vazamentos'
        });
      }

      const heapLimitWarningThreshold = 90;
      if (heapTotalMB > heapLimitMB * (heapLimitWarningThreshold / 100)) {
        logger.warn('Heap total aproximando-se do limite máximo', {
          heap_total_mb: heapTotalMB,
          heap_limit_mb: heapLimitMB,
          percentage_of_limit: Math.round((heapTotalMB / heapLimitMB) * 100),
          recommendation:
            'O heap está se aproximando do limite máximo configurado'
        });
      }

      // Verificar RSS (total memory)
      if (rssMB > 700) {
        // 700MB de RSS
        logger.warn('Uso de memória RSS alto', {
          rss_mb: rssMB,
          recommendation: 'Verificar possíveis vazamentos de memória'
        });
      }
    } catch (error) {
      logger.error('Erro ao verificar uso de memória', {
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  public getMemoryStats() {
    const memUsage = process.memoryUsage();
    return {
      heap_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
      heap_total_mb: Math.round(memUsage.heapTotal / 1024 / 1024),
      heap_usage_percent: Math.round(
        (memUsage.heapUsed / memUsage.heapTotal) * 100
      ),
      rss_mb: Math.round(memUsage.rss / 1024 / 1024),
      external_mb: Math.round(memUsage.external / 1024 / 1024),
      array_buffers_mb: Math.round(memUsage.arrayBuffers / 1024 / 1024),
      uptime_hours: Math.round((process.uptime() / 3600) * 100) / 100,
      gc_available: this.isGCAvailable
    };
  }
}
