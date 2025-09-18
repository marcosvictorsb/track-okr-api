import { asyncLocalStorage, RequestContext } from '@configs/async.context';
import { logger } from '@configs/logger';
import { NextFunction, Request, Response } from 'express';
import uuid4 from 'uuid4';

export interface ExtendedRequest extends Request {
  startTime?: number;
  requestSize?: number;
}

export interface ExtendedResponse extends Response {
  responseSize?: number;
}

/**
 * Middleware avançado de logging que captura informações detalhadas da requisição e resposta
 */
export const requestLoggingMiddleware = () => {
  return (req: ExtendedRequest, res: ExtendedResponse, next: NextFunction) => {
    const requestId = uuid4();
    const startTime = Date.now();

    // Calcular tamanho da requisição
    const requestSize =
      JSON.stringify(req.body || {}).length +
      JSON.stringify(req.query || {}).length +
      JSON.stringify(req.params || {}).length;

    const requestContext: RequestContext = {
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      path: req.path,
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      referer: req.get('Referer') || '',
      origin: req.get('Origin') || '',
      requestSize,
      timestamp: new Date().toISOString()
    };

    // Tentar extrair userId e companyId do token se disponível
    try {
      const authHeader = req.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // Aqui você pode decodificar o JWT para extrair userId e companyId
        // const decoded = jwt.decode(authHeader.split(' ')[1]) as any;
        // requestContext.userId = decoded?.id;
        // requestContext.companyId = decoded?.id_company;
      }
    } catch {
      // Silenciosamente ignorar erros de decodificação
    }

    req.startTime = startTime;
    req.requestSize = requestSize;

    // Interceptar o método de escrita da resposta para capturar dados
    const originalSend = res.send;
    const originalJson = res.json;
    const originalEnd = res.end;

    let responseBody = '';
    let responseSent = false;

    // Wrapper para capturar o corpo da resposta
    const captureResponse = (data: unknown) => {
      if (!responseSent) {
        try {
          responseBody =
            typeof data === 'string' ? data : JSON.stringify(data || {});
          res.responseSize = responseBody.length;
        } catch {
          res.responseSize = 0;
        }
        responseSent = true;
      }
      return data;
    };

    // Override dos métodos de resposta
    res.send = function (data: unknown) {
      captureResponse(data);
      return originalSend.call(this, data);
    };

    res.json = function (data: unknown) {
      captureResponse(data);
      return originalJson.call(this, data);
    };

    res.end = function (chunk?: unknown) {
      if (chunk && !responseSent) {
        captureResponse(chunk);
      }
      return originalEnd.call(this, chunk);
    };

    // Quando a resposta for finalizada, logar as informações completas
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      const statusCode = res.statusCode;

      const finalContext: RequestContext = {
        ...requestContext,
        statusCode,
        responseTime,
        responseSize: res.responseSize || 0
      };

      // Determinar o nível de log baseado no status code
      const logLevel = getLogLevel(statusCode);
      const message = `${req.method} ${req.path} - ${statusCode} - ${responseTime}ms`;

      // Atualizar o contexto no AsyncLocalStorage
      asyncLocalStorage.enterWith(finalContext);

      // Logar com base no nível apropriado
      logger[logLevel](message, {
        request: {
          method: req.method,
          url: req.originalUrl,
          path: req.path,
          query: req.query,
          params: req.params,
          ip: finalContext.ip,
          userAgent: finalContext.userAgent,
          referer: finalContext.referer,
          origin: finalContext.origin,
          size: finalContext.requestSize
        },
        response: {
          statusCode,
          responseTime,
          size: finalContext.responseSize
        },
        user: {
          id: finalContext.userId,
          companyId: finalContext.companyId
        },
        performance: {
          responseTime,
          requestSize: finalContext.requestSize,
          responseSize: finalContext.responseSize
        }
      });
    });

    // Executar dentro do contexto assíncrono
    asyncLocalStorage.run(requestContext, () => {
      logger.info(`Incoming request: ${req.method} ${req.path}`, {
        ip: requestContext.ip,
        userAgent: requestContext.userAgent,
        requestSize: requestContext.requestSize
      });
      next();
    });
  };
};

/**
 * Determina o nível de log baseado no status code
 */
function getLogLevel(statusCode: number): 'info' | 'warn' | 'error' {
  if (statusCode >= 500) {
    return 'error';
  } else if (statusCode >= 400) {
    return 'warn';
  }
  return 'info';
}

/**
 * Middleware para extrair informações do usuário autenticado
 */
export const userContextMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const store = asyncLocalStorage.getStore();
    if (store) {
      try {
        // Extrair informações do usuário se disponível no req
        const user = (req as { user?: { id?: number; id_company?: number } })
          .user;
        if (user) {
          const updatedContext: RequestContext = {
            ...store,
            userId: user.id,
            companyId: user.id_company
          };
          asyncLocalStorage.enterWith(updatedContext);
        }
      } catch {
        // Silenciosamente ignorar erros
      }
    }
    next();
  };
};
