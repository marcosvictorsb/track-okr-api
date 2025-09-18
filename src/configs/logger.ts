import { Client } from '@opensearch-project/opensearch';
import { createLogger, format, Logger, transports } from 'winston';
import { asyncLocalStorage } from './async.context';

const logLevels: Record<string, number> = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5
};

const isProduction = process.env.NODE_ENV === 'production';

// Classe personalizada para OpenSearch Transport
class OpenSearchTransport extends transports.Stream {
  private client: Client;
  private index: string;

  constructor(options: Record<string, unknown>) {
    super({ stream: process.stdout, ...options });

    this.client = new Client({
      node: process.env.OPENSEARCH_URL || 'https://localhost:9200',
      auth: {
        username: process.env.OPENSEARCH_USERNAME || 'admin',
        password: process.env.OPENSEARCH_PASSWORD || 'MyStrongPassword123!'
      },
      ssl: {
        rejectUnauthorized: process.env.OPENSEARCH_SSL_VERIFY !== 'false'
      }
    });

    this.index = process.env.OPENSEARCH_INDEX || 'gunno-logs';
  }

  log(info: Record<string, unknown>, callback: () => void) {
    setImmediate(() => this.emit('logged', info));

    // Não bloquear o callback
    callback();

    // Processar o log de forma assíncrona
    this.sendToOpenSearch(info).catch((error) => {
      console.error('❌ Erro ao enviar log para OpenSearch:', error.message);
    });
  }

  private async sendToOpenSearch(info: Record<string, unknown>) {
    try {
      const store = asyncLocalStorage.getStore();
      const requestId = store?.requestId || 'no-request-id';

      // Achatar a estrutura para evitar conflitos de mapeamento
      const document = {
        '@timestamp': new Date().toISOString(),
        timestamp: info.timestamp,
        level: info.level,
        message: info.message,
        requestId,
        environment: process.env.NODE_ENV,
        service: 'track-okr-api',
        // Informações da requisição (campos com nomes únicos)
        httpMethod: store?.method,
        httpUrl: store?.url,
        httpPath: store?.path,
        clientIp: store?.ip,
        clientUserAgent: store?.userAgent,
        clientReferer: store?.referer,
        clientOrigin: store?.origin,
        requestBodySize: store?.requestSize,
        // Informações da resposta (campos com nomes únicos)
        httpStatusCode: store?.statusCode,
        responseTimeMs: store?.responseTime,
        responseBodySize: store?.responseSize,
        // Informações do usuário (campos com nomes únicos)
        userId: store?.userId,
        companyId: store?.companyId,
        // Métricas de performance (campos com nomes únicos)
        performanceResponseTime: store?.responseTime,
        performanceRequestSize: store?.requestSize,
        performanceResponseSize: store?.responseSize,
        // Outros campos do log
        ...Object.keys(info).reduce(
          (acc, key) => {
            if (!['timestamp', 'level', 'message'].includes(key)) {
              acc[key] = info[key];
            }
            return acc;
          },
          {} as Record<string, unknown>
        )
      };

      await this.client.index({
        index: this.index,
        body: document
      });

      console.log(
        `✅ Log enviado para OpenSearch: ${info.level} - ${info.message}`
      );
    } catch (error) {
      console.error('❌ Erro ao enviar log para OpenSearch:', error.message);
    }
  }
}

// Configuração do transport do OpenSearch para produção
const createOpenSearchTransport = () => {
  if (!isProduction) return null;

  try {
    return new OpenSearchTransport({
      level: 'info'
    });
  } catch (error) {
    console.error('❌ Erro ao configurar OpenSearch transport:', error);
    return null;
  }
};

// Criar array de transports
const createTransports = () => {
  const transportsList: transports.ConsoleTransportInstance[] = [
    new transports.Console()
  ];

  const opensearchTransport = createOpenSearchTransport();
  if (opensearchTransport) {
    transportsList.push(
      opensearchTransport as unknown as transports.ConsoleTransportInstance
    );
  }

  return transportsList;
};

const logFormat = isProduction
  ? format.combine(
      format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
      format.printf(({ timestamp, level, message, ...meta }) => {
        const store = asyncLocalStorage.getStore();
        const requestId = store?.requestId || 'no-request-id';
        return JSON.stringify({
          timestamp,
          level,
          message,
          requestId,
          ...meta
        });
      })
    )
  : format.combine(
      format.colorize(),
      format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
      format.printf((info) => {
        const { timestamp, level, message, ...meta } = info;
        const store = asyncLocalStorage.getStore();
        const requestId = store?.requestId || 'no-request-id';
        const metaData = meta.data || meta;
        const metaString =
          metaData && Object.keys(metaData).length
            ? JSON.stringify(metaData, null, 2)
            : '';
        return `${timestamp} [${level}] [${requestId}]: ${message} ${metaString}`;
      })
    );

export const logger: Logger = createLogger({
  levels: logLevels,
  format: logFormat,
  transports: createTransports()
});
