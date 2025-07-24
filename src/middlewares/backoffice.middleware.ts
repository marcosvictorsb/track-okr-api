import { Request, Response, NextFunction } from 'express';

export interface BackofficeAuthRequest extends Request {
  backoffice_user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware simples de autenticação para backoffice
 * Em produção, implementar com JWT e roles adequados
 */
export const backofficeAuth = (
  req: BackofficeAuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'Token de autorização necessário'
      });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    // Validação simples com token fixo para desenvolvimento
    // Em produção, usar JWT e validação adequada
    const validTokens = [
      process.env.BACKOFFICE_TOKEN || 'backoffice_dev_token_2025',
      'admin_master_key_dev'
    ];

    if (!validTokens.includes(token)) {
      res.status(403).json({
        success: false,
        message: 'Token inválido'
      });
      return;
    }

    // Simular usuário autenticado
    req.backoffice_user = {
      id: 'admin_1',
      email: 'admin@trackokr.com',
      role: 'admin'
    };

    next();
  } catch {
    res.status(500).json({
      success: false,
      message: 'Erro na validação de autenticação'
    });
  }
};

/**
 * Middleware de log para auditoria do backoffice
 */
export const backofficeAuditLog = (
  req: BackofficeAuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  // Log da requisição
  console.log(`[BACKOFFICE] ${req.method} ${req.path}`, {
    user: req.backoffice_user?.email || 'unknown',
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method !== 'GET' ? req.body : undefined,
    query: req.query,
    timestamp: new Date().toISOString()
  });

  // Override do res.json para logar a resposta
  const originalJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - startTime;

    console.log(`[BACKOFFICE] Response ${req.method} ${req.path}`, {
      user: req.backoffice_user?.email || 'unknown',
      status: res.statusCode,
      duration: `${duration}ms`,
      success: data.success || false,
      timestamp: new Date().toISOString()
    });

    return originalJson.call(this, data);
  };

  next();
};
