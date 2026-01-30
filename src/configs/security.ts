import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

// Configuração do Helmet para headers de segurança
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false, // Permite embedding de recursos cross-origin
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Permite acesso cross-origin
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true
});

// Headers específicos para uploads com CORS apropriado
export const uploadSecurityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const origin = req.header('origin') || req.header('Origin');

  // Configurar CORS para uploads
  if (origin) {
    const whitelist = [
      /^http(s)?:\/\/(.*\.)?localhost(:[0-9]*)?(\/.*)?$/g,
      /^http(s)?:\/\/127\.0\.0\.1(:[0-9]*)?(\/.*)?$/g,
      /^http(s)?:\/\/(.*\.)?trackokr.com.br(\/.*)?$/g
    ];

    if (whitelist.some((domain) => domain.test(origin))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  // Headers de segurança mais permissivos para imagens
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache por 1 ano

  next();
};
