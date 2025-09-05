import { createLogger, format, transports, Logger } from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
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

// Configuração do transport do OpenSearch para produção
const createOpenSearchTransport = () => {
  if (!isProduction) return null;

  const opensearchConfig = {
    level: 'info',
    clientOpts: {
      node: process.env.OPENSEARCH_URL || 'https://opensearch.gunno.io/api/',
      // auth: {
      //   username: process.env.OPENSEARCH_USERNAME || 'admin',
      //   password: process.env.OPENSEARCH_PASSWORD || 'admin'
      // },
      ssl: {
        rejectUnauthorized: process.env.OPENSEARCH_SSL_VERIFY !== 'false'
      }
    },
    index: process.env.OPENSEARCH_INDEX || 'track-okr-logs',
    typeName: '_doc',
    transformer: (logData: {
      level: string;
      message: string;
      meta?: Record<string, unknown>;
    }) => {
      const store = asyncLocalStorage.getStore();
      const requestId = store?.requestId || 'no-request-id';

      return {
        '@timestamp': new Date().toISOString(),
        level: logData.level,
        message: logData.message,
        requestId,
        environment: process.env.NODE_ENV,
        service: 'track-okr-api',
        ...logData.meta
      };
    }
  };

  return new ElasticsearchTransport(opensearchConfig);
};

// Criar array de transports
const createTransports = () => {
  const transportsList: (
    | transports.ConsoleTransportInstance
    | ElasticsearchTransport
  )[] = [new transports.Console()];

  const opensearchTransport = createOpenSearchTransport();
  if (opensearchTransport) {
    transportsList.push(opensearchTransport);
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
