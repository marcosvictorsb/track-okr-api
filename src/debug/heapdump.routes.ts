import memwatch from '@airbnb/node-memwatch';
import { Router } from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import v8 from 'v8';

const router = Router();

// Variáveis para controle de memory leaks
let leakDetector: memwatch.HeapDiff | null = null;
let leakDetectionEnabled = false;

/**
 * Rota para status de memória
 * GET /debug/memory
 */
router.get('/memory', (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const heapStats = v8.getHeapStatistics();

    res.json({
      timestamp: new Date().toISOString(),
      process: {
        pid: process.pid,
        uptime: Math.round(process.uptime()) + ' seconds',
        version: process.version,
        memoryUsage: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
          external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB',
          arrayBuffers:
            Math.round(memoryUsage.arrayBuffers / 1024 / 1024) + ' MB'
        }
      },
      v8Heap: {
        totalHeapSize:
          Math.round(heapStats.total_heap_size / 1024 / 1024) + ' MB',
        usedHeapSize:
          Math.round(heapStats.used_heap_size / 1024 / 1024) + ' MB',
        heapSizeLimit:
          Math.round(heapStats.heap_size_limit / 1024 / 1024) + ' MB',
        totalAvailableSize:
          Math.round(heapStats.total_available_size / 1024 / 1024) + ' MB',
        totalPhysicalSize:
          Math.round(heapStats.total_physical_size / 1024 / 1024) + ' MB',
        percentUsed:
          Math.round(
            (heapStats.used_heap_size / heapStats.heap_size_limit) * 100
          ) + '%',
        // ✅ Corrigido: usando propriedades corretas do v8
        totalGlobalHandlesSize:
          Math.round((heapStats.total_global_handles_size || 0) / 1024 / 1024) +
          ' MB',
        usedGlobalHandlesSize:
          Math.round((heapStats.used_global_handles_size || 0) / 1024 / 1024) +
          ' MB',
        numberOfNativeContexts: heapStats.number_of_native_contexts || 0,
        numberOfDetachedContexts: heapStats.number_of_detached_contexts || 0
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        maxOldSpaceSize: process.env.NODE_OPTIONS?.includes(
          'max-old-space-size'
        )
          ? process.env.NODE_OPTIONS.match(/max-old-space-size=(\d+)/)?.[1] +
            ' MB'
          : 'default'
      }
    });
  } catch (error) {
    console.error('❌ Error in /debug/memory:', error);
    res.status(500).json({
      error: 'Failed to get memory info',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Rota para gerar heap snapshot usando v8 nativo
 * GET /debug/heapdump
 */
router.get('/heapdump', async (req, res) => {
  let filepath: string | null = null;

  try {
    const filename = `heapdump-${Date.now()}-${process.pid}.heapsnapshot`;
    filepath = path.join('/tmp', filename);

    console.log(`🔄 Generating heap snapshot: ${filename}`);

    // Gerar snapshot usando v8 nativo - retorna um Readable stream
    const snapshotStream = v8.getHeapSnapshot();

    // Criar write stream para o arquivo
    const writeStream = fs.createWriteStream(filepath);

    // Pipe do snapshot para o arquivo
    snapshotStream.pipe(writeStream);

    // Esperar até que o stream termine
    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => resolve());
      writeStream.on('error', reject);
      snapshotStream.on('error', reject);
    });

    console.log(`✅ Heap snapshot created: ${filepath}`);

    // Configurar headers para download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-Heapdump-Size', fs.statSync(filepath).size.toString());
    res.setHeader('X-Heapdump-PID', process.pid.toString());

    // Stream do arquivo para resposta
    const readStream = fs.createReadStream(filepath);
    readStream.pipe(res);

    // Limpar arquivo após download
    readStream.on('end', () => {
      try {
        if (filepath) {
          fs.unlinkSync(filepath);
          console.log(`🧹 Cleaned up heap snapshot: ${filepath}`);
        }
      } catch (cleanupError) {
        console.warn('⚠️ Could not clean up heap snapshot:', cleanupError);
      }
    });

    readStream.on('error', (streamError) => {
      console.error('❌ Read stream error:', streamError);
      if (!res.headersSent) {
        res
          .status(500)
          .json({ error: 'Read stream error', message: streamError.message });
      }
    });
  } catch (error) {
    console.error('❌ Error in /debug/heapdump:', error);

    // Limpar arquivo em caso de erro
    if (filepath && fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
      } catch (cleanupError) {
        console.warn('⚠️ Could not clean up failed snapshot:', cleanupError);
      }
    }

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to create heap dump',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

/**
 * Rota para forçar garbage collection
 * POST /debug/gc
 */
router.post('/gc', (req, res) => {
  try {
    if (global.gc) {
      const before = process.memoryUsage();
      global.gc();
      const after = process.memoryUsage();

      const freedMemory = before.heapUsed - after.heapUsed;

      res.json({
        success: true,
        message: `Garbage collection executed, freed ${Math.round(freedMemory / 1024 / 1024)} MB`,
        memory: {
          before: {
            heapUsed: Math.round(before.heapUsed / 1024 / 1024) + ' MB',
            heapTotal: Math.round(before.heapTotal / 1024 / 1024) + ' MB'
          },
          after: {
            heapUsed: Math.round(after.heapUsed / 1024 / 1024) + ' MB',
            heapTotal: Math.round(after.heapTotal / 1024 / 1024) + ' MB'
          },
          freed: {
            bytes: freedMemory,
            megabytes: Math.round(freedMemory / 1024 / 1024) + ' MB',
            percent: Math.round((freedMemory / before.heapUsed) * 100) + '%'
          }
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Garbage collection not available',
        message: 'Start Node.js with --expose-gc flag',
        solution: 'Add "node_args": "--expose-gc" to your PM2 config'
      });
    }
  } catch (error) {
    console.error('❌ Error in /debug/gc:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute GC',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Rota para iniciar detecção de memory leaks
 * POST /debug/leak-detection/start
 */
router.post('/leak-detection/start', (req, res) => {
  try {
    if (leakDetector) {
      return res.json({
        message: 'Leak detection already running',
        currentState: leakDetectionEnabled
      });
    }

    leakDetector = new memwatch.HeapDiff();
    leakDetectionEnabled = true;

    memwatch.on('leak', (info) => {
      console.log('🚨 MEMORY LEAK DETECTED:', info);
    });

    res.json({
      success: true,
      message: 'Memory leak detection started',
      pid: process.pid
    });
  } catch (error) {
    console.error('❌ Error starting leak detection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start leak detection',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Rota para parar detecção de memory leaks e gerar relatório
 * POST /debug/leak-detection/stop
 */
router.post('/leak-detection/stop', (req, res) => {
  try {
    if (!leakDetector) {
      return res.status(400).json({
        success: false,
        error: 'Leak detection not running',
        message: 'Start leak detection first with /debug/leak-detection/start'
      });
    }

    const report = leakDetector.end();
    leakDetector = null;
    leakDetectionEnabled = false;

    res.json({
      success: true,
      message: 'Leak detection stopped and report generated',
      report: {
        before: {
          size: Math.round(report.before.size / 1024 / 1024) + ' MB',
          nodes: report.before.nodes
        },
        after: {
          size: Math.round(report.after.size / 1024 / 1024) + ' MB',
          nodes: report.after.nodes
        },
        change: {
          size: Math.round(report.change.size / 1024 / 1024) + ' MB',
          size_bytes: report.change.size,
          nodes: report.change.nodes,
          growth:
            Math.round((report.change.size / report.before.size) * 100) + '%'
        }
      }
    });
  } catch (error) {
    console.error('❌ Error stopping leak detection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop leak detection',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Rota para status do leak detection
 * GET /debug/leak-detection/status
 */
router.get('/leak-detection/status', (req, res) => {
  res.json({
    enabled: leakDetectionEnabled,
    pid: process.pid,
    hasDetector: !!leakDetector,
    timestamp: new Date().toISOString()
  });
});

/**
 * Rota para informações do processo
 * GET /debug/process-info
 */
router.get('/process-info', (req, res) => {
  try {
    res.json({
      process: {
        pid: process.pid,
        uptime: Math.round(process.uptime()) + ' seconds',
        version: process.version,
        versions: process.versions,
        arch: process.arch,
        platform: process.platform,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        resourceUsage: process.resourceUsage?.(),
        env: {
          NODE_ENV: process.env.NODE_ENV,
          NODE_OPTIONS: process.env.NODE_OPTIONS
        }
      },
      system: {
        cpus: os.cpus().length,
        totalMemory: Math.round(os.totalmem() / 1024 / 1024) + ' MB',
        freeMemory: Math.round(os.freemem() / 1024 / 1024) + ' MB',
        loadAverage: os.loadavg(),
        uptime: Math.round(os.uptime() / 3600) + ' hours'
      }
    });
  } catch (error) {
    console.error('❌ Error in /debug/process-info:', error);
    res.status(500).json({
      error: 'Failed to get process info',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
