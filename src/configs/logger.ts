import { createLogger, format, transports, Logger } from 'winston';
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
  transports: [new transports.Console()]
});
