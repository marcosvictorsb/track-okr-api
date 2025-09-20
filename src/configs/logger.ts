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

    // Não bloquear o callback - chamá-lo imediatamente
    callback();

    // Processar o log de forma assíncrona apenas para error e warn
    // Remover códigos ANSI de cor que o Winston pode adicionar
    const escapeChar = String.fromCharCode(27); // ESC character
    const ansiColorRegex = new RegExp(escapeChar + '\\[[0-9;]*m', 'g');
    const level = String(info.level)
      .toLowerCase()
      .replace(ansiColorRegex, '')
      .trim();

    if (level === 'error' || level === 'warn') {
      // Timeout para evitar acúmulo de promises pendentes
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

      // Remover códigos ANSI do level também aqui
      const escapeChar = String.fromCharCode(27);
      const ansiColorRegex = new RegExp(escapeChar + '\\[[0-9;]*m', 'g');
      const cleanLevel = String(info.level).replace(ansiColorRegex, '').trim();

      // Determinar cor do embed baseado no nível
      const color = cleanLevel === 'error' ? 15158332 : 16776960; // vermelho para error, amarelo para warn
      const emoji = cleanLevel === 'error' ? '🚨' : '⚠️';

      // Criar embed estruturado para Discord
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

      // Adicionar informações da requisição se disponível
      if (store?.method && store?.path) {
        embed.fields.push({
          name: '📡 Request',
          value: `${store.method} ${store.path}`,
          inline: true
        });
      }

      // Adicionar status code se disponível
      if (store?.statusCode) {
        embed.fields.push({
          name: '📊 Status Code',
          value: store.statusCode.toString(),
          inline: true
        });
      }

      // Adicionar informações do usuário se disponível
      if (store?.userId) {
        embed.fields.push({
          name: '👤 User ID',
          value: store.userId.toString(),
          inline: true
        });
      }

      // Adicionar stack trace para erros (limitado para não exceder limites do Discord)
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
        rejectUnauthorized: false // process.env.OPENSEARCH_SSL_VERIFY !== 'false'
      }
    });

    this.index = process.env.OPENSEARCH_INDEX || 'gunno-logs';
  }

  private sanitizeFieldForOpenSearch(
    key: string,
    value: unknown
  ): [string, string] {
    // Lista de campos que causam conflitos de mapeamento
    const problematicFields = [
      'data',
      'criteria',
      'original',
      'parent',
      'updateData',
      'requestTxt'
    ];

    // Se o campo é problemático, prefixar com 'raw_' para evitar conflitos
    const finalKey = problematicFields.includes(key) ? `raw_${key}` : key;

    // Sempre converter para string para evitar qualquer conflito de tipo
    let finalValue: string;

    if (value === null || value === undefined) {
      finalValue = '';
    } else if (typeof value === 'object') {
      try {
        finalValue = JSON.stringify(value);
      } catch {
        finalValue = String(value);
      }
    } else {
      finalValue = String(value);
    }

    return [finalKey, finalValue];
  }

  log(info: Record<string, unknown>, callback: () => void) {
    setImmediate(() => this.emit('logged', info));

    // Não bloquear o callback - chamá-lo imediatamente
    callback();

    // Processar o log de forma assíncrona com timeout para evitar acúmulo
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
        // Outros campos do log - sanitizar para evitar conflitos de mapeamento
        ...Object.keys(info).reduce(
          (acc, key) => {
            if (!['timestamp', 'level', 'message'].includes(key)) {
              const [finalKey, finalValue] = this.sanitizeFieldForOpenSearch(
                key,
                info[key]
              );
              acc[finalKey] = finalValue;
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

// Configuração do transport do Discord para logs de error e warn
const createDiscordTransport = () => {
  // Só ativar Discord logging em produção
  console.log('------------------------------->');
  console.log('isProduction:', isProduction);
  if (!isProduction) {
    console.log(
      '📝 Discord logging desabilitado em ambiente de desenvolvimento'
    );
    return null;
  }

  const webhookUrl =
    'https://discord.com/api/webhooks/1418339674505609355/oYP7oVEDhsIl-HMncwKdSck1JaWo2QxIKuP7QeH5CgY_jpwB7HInsrvuLqsm4-vAh1dB';

  if (!webhookUrl) {
    console.warn('⚠️ Discord webhook URL não configurado');
    return null;
  }

  try {
    console.log('📱 Discord logging ativado para ambiente de produção');
    return new DiscordTransport({
      level: 'warn', // Captura warn e error (error tem prioridade maior que warn)
      webhookUrl
    });
  } catch (error) {
    console.error('❌ Erro ao configurar Discord transport:', error);
    return null;
  }
};

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

  // Adicionar Discord transport para error e warn
  const discordTransport = createDiscordTransport();
  if (discordTransport) {
    transportsList.push(
      discordTransport as unknown as transports.ConsoleTransportInstance
    );
  }

  // Adicionar OpenSearch transport para produção
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
