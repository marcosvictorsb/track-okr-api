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

export const requestLoggingMiddleware = () => {
  return (req: ExtendedRequest, res: ExtendedResponse, next: NextFunction) => {
    const requestId = uuid4();
    const startTime = Date.now();

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

    try {
      // const authHeader = req.get('Authorization');
      // if (authHeader && authHeader.startsWith('Bearer ')) {
      //   const token = authHeader.slice(7);
      //   const payloadBase64 = token.split('.')[1];
      //   const payloadJson = Buffer.from(payloadBase64, 'base64').toString(
      //     'utf-8'
      //   );
      //   const payload = JSON.parse(payloadJson);
      //   if (payload && typeof payload === 'object') {
      //     if (typeof payload.id === 'number') {
      //       requestContext.userId = payload.id;
      //     }
      //     if (typeof payload.id_company === 'number') {
      //       requestContext.companyId = payload.id_company;
      //     }
      //   }
      // }

    } catch {
      // Falha ao extrair informações do token, continuar sem userId/companyId
    }

    req.startTime = startTime;
    req.requestSize = requestSize;

    const originalSend = res.send;
    const originalJson = res.json;
    const originalEnd = res.end;

    let responseBody = '';
    let responseSent = false;

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

    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      const statusCode = res.statusCode;

      const finalContext: RequestContext = {
        ...requestContext,
        statusCode,
        responseTime,
        responseSize: res.responseSize || 0
      };

      const logLevel = getLogLevel(statusCode);
      const message = `${req.method} ${req.path} - ${statusCode} - ${responseTime}ms`;

      asyncLocalStorage.enterWith(finalContext);

      logger[logLevel](message, {
        httpMethod: req.method,
        httpUrl: req.originalUrl,
        httpPath: req.path,
        clientIp: finalContext.ip,
        clientUserAgent: finalContext.userAgent,
        clientReferer: finalContext.referer,
        clientOrigin: finalContext.origin,
        requestBodySize: finalContext.requestSize,
        httpStatusCode: statusCode,
        responseTimeMs: responseTime,
        responseBodySize: finalContext.responseSize,
        userId: finalContext.userId,
        companyId: finalContext.companyId,
        performanceResponseTime: responseTime,
        performanceRequestSize: finalContext.requestSize,
        performanceResponseSize: finalContext.responseSize
      });
    });

    asyncLocalStorage.run(requestContext, () => {
      logger.info(`Incoming request: ${req.method} ${req.path}`, {
        clientIp: requestContext.ip,
        clientUserAgent: requestContext.userAgent,
        requestBodySize: requestContext.requestSize
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

export const userContextMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const store = asyncLocalStorage.getStore();
    if (store) {
      try {
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
      } catch {}
    }
    next();
  };
};
