import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

// Configuração do Helmet para headers de segurança
export const helmetConfig = helmet({
  // ...existing code...

  // X-XSS-Protection
  xssFilter: true
});

// Headers específicos para uploads
export const uploadSecurityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
};
