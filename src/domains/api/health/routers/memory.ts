import { Request, Response, Router } from 'express';

const router = Router();

// Endpoint para forçar garbage collection e monitorar memória
router.get('/memory', (req: Request, res: Response) => {
  try {
    const beforeGC = process.memoryUsage();

    // Forçar garbage collection se disponível
    if (global.gc) {
      global.gc();
    }

    const afterGC = process.memoryUsage();
    const heapUsagePercent = Math.round(
      (afterGC.heapUsed / afterGC.heapTotal) * 100
    );

    res.json({
      status: 'OK',
      memory: {
        before_gc: {
          rss: Math.round(beforeGC.rss / 1024 / 1024) + 'MB',
          heapTotal: Math.round(beforeGC.heapTotal / 1024 / 1024) + 'MB',
          heapUsed: Math.round(beforeGC.heapUsed / 1024 / 1024) + 'MB',
          external: Math.round(beforeGC.external / 1024 / 1024) + 'MB'
        },
        after_gc: {
          rss: Math.round(afterGC.rss / 1024 / 1024) + 'MB',
          heapTotal: Math.round(afterGC.heapTotal / 1024 / 1024) + 'MB',
          heapUsed: Math.round(afterGC.heapUsed / 1024 / 1024) + 'MB',
          external: Math.round(afterGC.external / 1024 / 1024) + 'MB',
          arrayBuffers: Math.round(afterGC.arrayBuffers / 1024 / 1024) + 'MB'
        },
        heap_usage_percent: heapUsagePercent + '%',
        freed_memory:
          Math.round((beforeGC.heapUsed - afterGC.heapUsed) / 1024 / 1024) +
          'MB',
        uptime: Math.round(process.uptime()) + 's',
        gc_available: !!global.gc
      },
      recommendations:
        heapUsagePercent > 80
          ? [
              'Heap usage is high (>80%)',
              'Consider restarting the application',
              'Check for memory leaks',
              'Consider increasing memory limit'
            ]
          : []
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Endpoint para forçar garbage collection
router.post('/gc', (req: Request, res: Response) => {
  try {
    const before = process.memoryUsage();

    if (global.gc) {
      global.gc();
      const after = process.memoryUsage();
      const freedMB = Math.round(
        (before.heapUsed - after.heapUsed) / 1024 / 1024
      );

      res.json({
        status: 'OK',
        message: 'Garbage collection forced',
        freed_memory: freedMB + 'MB',
        heap_usage_before: Math.round(before.heapUsed / 1024 / 1024) + 'MB',
        heap_usage_after: Math.round(after.heapUsed / 1024 / 1024) + 'MB'
      });
    } else {
      res.status(400).json({
        status: 'ERROR',
        message:
          'Garbage collection not available. Start Node.js with --expose-gc flag'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
