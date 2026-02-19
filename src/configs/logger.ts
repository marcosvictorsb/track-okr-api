import { Client } from '@opensearch-project/opensearch';
import axios from 'axios';
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

// Classe personalizada para Discord Transport
class DiscordTransport extends transports.Stream {
  private webhookUrl: string;

  constructor(options: Record<string, unknown> & { webhookUrl: string }) {
    super({ stream: process.stdout, ...options });
    this.webhookUrl = options.webhookUrl;
  }

  log(info: Record<string, unknown>, callback: () => void) {
    setImmediate(() => this.emit('logged', info));

    callback();

    const escapeChar = String.fromCharCode(27); // ESC character
    const ansiColorRegex = new RegExp(escapeChar + '\\[[0-9;]*m', 'g');
    const level = String(info.level)
      .toLowerCase()
      .replace(ansiColorRegex, '')
      .trim();

    if (level === 'error' || level === 'warn') {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Discord timeout')), 10000);
      });

      Promise.race([this.sendToDiscord(info), timeoutPromise]).catch(
        (error) => {
          console.error('❌ Erro ao enviar log para Discord:', error.message);
        }
      );
    }
  }

  private async sendToDiscord(info: Record<string, unknown>) {
    try {
      const store = asyncLocalStorage.getStore();
      const requestId = store?.requestId || 'no-request-id';

      const escapeChar = String.fromCharCode(27);
      const ansiColorRegex = new RegExp(escapeChar + '\\[[0-9;]*m', 'g');
      const cleanLevel = String(info.level).replace(ansiColorRegex, '').trim();

      const color = cleanLevel === 'error' ? 15158332 : 16776960; // vermelho para error, amarelo para warn
      const emoji = cleanLevel === 'error' ? '🚨' : '⚠️';

      const embed = {
        title: `${emoji} ${cleanLevel.toUpperCase()} - Track OKR API`,
        description: info.message?.toString() || 'Sem mensagem',
        color,
        fields: [
          {
            name: '🔗 Request ID',
            value: requestId,
            inline: true
          },
          {
            name: '🌍 Environment',
            value: process.env.NODE_ENV || 'unknown',
            inline: true
          },
          {
            name: '⏰ Timestamp',
            value: new Date().toLocaleString('pt-BR', {
              timeZone: 'America/Sao_Paulo'
            }),
            inline: true
          }
        ],
        footer: {
          text: 'Track OKR API Monitoring'
        }
      };

      if (store?.method && store?.path) {
        embed.fields.push({
          name: '📡 Request',
          value: `${store.method} ${store.path}`,
          inline: true
        });
      }

      if (store?.statusCode) {
        embed.fields.push({
          name: '📊 Status Code',
          value: store.statusCode.toString(),
          inline: true
        });
      }

      if (store?.userId) {
        embed.fields.push({
          name: '👤 User ID',
          value: store.userId.toString(),
          inline: true
        });
      }

      if (cleanLevel === 'error' && info.stack) {
        const stackTrace = info.stack.toString();
        embed.fields.push({
          name: '📝 Stack Trace',
          value:
            stackTrace.length > 1000
              ? stackTrace.substring(0, 997) + '...'
              : stackTrace,
          inline: false
        });
      }

      const payload = {
        username: 'Track OKR Monitor',
        avatar_url: 'https://cdn-icons-png.flaticon.com/512/2965/2965879.png',
        embeds: [embed]
      };

      await axios.post(this.webhookUrl, payload);

      console.log(
        `✅ Log enviado para Discord: ${cleanLevel} - ${info.message}`
      );
    } catch (error) {
      console.error('❌ Erro ao enviar log para Discord:', error);
      if (error.response) {
        console.error('📄 Response data:', error.response.data);
        console.error('📊 Response status:', error.response.status);
      }
    }
  }
}

class OpenSearchTransport extends transports.Stream {
  private client: Client;
  private index: string;

  constructor(options: Record<string, unknown>) {
    super({ stream: process.stdout, ...options });

    this.client = new Client({
      node: process.env.OPENSEARCH_URL,
      auth: {
        username: process.env.OPENSEARCH_USERNAME as string,
        password: process.env.OPENSEARCH_PASSWORD as string
      },
      ssl: {
        rejectUnauthorized: false
      }
    });

    this.index = process.env.OPENSEARCH_INDEX as string;
  }

  private sanitizeFieldForOpenSearch(
    key: string,
    value: unknown
  ): [string, string] {
    // Campos que conflitam com tipos esperados no mapping
    const problematicFields = [
      'data',
      'criteria',
      'original',
      'parent',
      'updateData',
      'requestTxt',
      'input'
    ];

    let finalKey = key;
    let finalValue: string;

    // Se for campo problemático, adicionar prefixo raw_
    if (problematicFields.includes(key)) {
      finalKey = `raw_${key}`;
    }

    // Processar o valor
    if (value === null || value === undefined) {
      finalValue = '';
    } else if (Array.isArray(value)) {
      // Arrays: converter para JSON string delimitado
      // Se são números, manter como array JSON; se são strings, também
      try {
        finalValue = JSON.stringify(value);
      } catch {
        finalValue = String(value);
      }
    } else if (typeof value === 'object') {
      // Objetos complexos: serializar como JSON
      try {
        finalValue = JSON.stringify(value);
      } catch {
        finalValue = String(value);
      }
    } else {
      // Valores primitivos: converter para string
      finalValue = String(value);
    }

    return [finalKey, finalValue];
  }

  log(info: Record<string, unknown>, callback: () => void) {
    setImmediate(() => this.emit('logged', info));

    callback();

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenSearch timeout')), 5000);
    });

    Promise.race([this.sendToOpenSearch(info), timeoutPromise]).catch(
      (error) => {
        console.error('❌ Erro ao enviar log para OpenSearch:', error.message);
      }
    );
  }

  private async sendToOpenSearch(info: Record<string, unknown>) {
    try {
      const store = asyncLocalStorage.getStore();
      const requestId = store?.requestId || 'no-request-id';

      const document = {
        '@timestamp': new Date().toISOString(),
        timestamp: info.timestamp,
        level: info.level,
        message: info.message,
        requestId,
        environment: process.env.NODE_ENV,
        service: 'track-okr-api',

        httpMethod: store?.method,
        httpUrl: store?.url,
        httpPath: store?.path,
        clientIp: store?.ip,
        clientUserAgent: store?.userAgent,
        clientReferer: store?.referer,
        clientOrigin: store?.origin,
        requestBodySize: store?.requestSize,

        httpStatusCode: store?.statusCode,
        responseTimeMs: store?.responseTime,
        responseBodySize: store?.responseSize,

        userId: store?.userId,
        companyId: store?.companyId,

        performanceResponseTime: store?.responseTime,
        performanceRequestSize: store?.requestSize,
        performanceResponseSize: store?.responseSize
      };

      // Processar metadados adicionais
      const metadata: Record<string, unknown> = {};
      const fieldsToIgnore = ['timestamp', 'level', 'message'];

      Object.keys(info).forEach((key) => {
        if (!fieldsToIgnore.includes(key)) {
          const [finalKey, finalValue] = this.sanitizeFieldForOpenSearch(
            key,
            info[key]
          );
          metadata[finalKey] = finalValue;
        }
      });

      // Mesclar document com metadata sanitizado
      const finalDocument = { ...document, ...metadata };

      await this.client.index({
        index: this.index,
        body: finalDocument
      });

      console.log(
        `✅ Log enviado para OpenSearch: ${info.level} - ${info.message}`
      );
    } catch (error) {
      console.error('❌ Erro ao enviar log para OpenSearch:', error.message);
      if (error instanceof Error && error.message) {
        console.error('📝 Detalhes do erro:', error.message);
      }
    }
  }
}

const createDiscordTransport = () => {
  if (!isProduction) {
    console.log(
      '📝 Discord logging desabilitado em ambiente de desenvolvimento'
    );
    return null;
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL as string;

  if (!webhookUrl) {
    console.warn('⚠️ Discord webhook URL não configurado');
    return null;
  }

  try {
    console.log('📱 Discord logging ativado para ambiente de produção');
    return new DiscordTransport({
      level: 'warn',
      webhookUrl
    });
  } catch (error) {
    console.error('❌ Erro ao configurar Discord transport:', error);
    return null;
  }
};

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

const createTransports = () => {
  const transportsList: transports.ConsoleTransportInstance[] = [
    new transports.Console()
  ];

  const discordTransport = createDiscordTransport();
  if (discordTransport) {
    transportsList.push(
      discordTransport as unknown as transports.ConsoleTransportInstance
    );
  }

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
