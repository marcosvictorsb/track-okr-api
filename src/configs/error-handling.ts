import { NextFunction, Request, Response } from 'express';
import { logger } from './logger';

export const secureErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as Request & { user?: { id: number } }).user?.id || 'anonymous'
  });

  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(500).json({
      success: false,
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Middleware para capturar requests não encontrados
 */
export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn('Route not found:', {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado',
    timestamp: new Date().toISOString()
  });
};

/**
 * Middleware para log de requests suspeitos
 */
export const suspiciousRequestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const suspiciousPatterns = [
    /\.\./, // Directory traversal
    /\bscript\b/i, // Script injection
    /<script/i, // XSS
    /union.*select/i, // SQL injection
    /javascript:/i, // JavaScript protocol
    /vbscript:/i, // VBScript protocol
    /data:/i // Data protocol
  ];

  const url = req.url.toLowerCase();
  const userAgent = req.get('User-Agent') || '';
  const referer = req.get('Referer') || '';

  // Verificar padrões suspeitos
  const isSuspicious = suspiciousPatterns.some(
    (pattern) =>
      pattern.test(url) || pattern.test(userAgent) || pattern.test(referer)
  );

  if (isSuspicious) {
    logger.warn('Suspicious request detected:', {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent,
      referer,
      body: req.body,
      query: req.query
    });
  }

  next();
};
