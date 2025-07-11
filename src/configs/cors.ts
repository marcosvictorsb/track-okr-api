import { Request, Response, NextFunction } from 'express';

const whitelist = (): RegExp[] => {
  const allowed: RegExp[] = [
    /^http(s)?:\/\/(.*\.)?boilerplate.com.br(\/.*)?$/g,
    /^http(s)?:\/\/(.*\.)?gunno.com.br(\/.*)?$/g,
    /^http(s)?:\/\/(.*\.)?trackokr.com.br(\/.*)?$/g
  ];

  const dev: RegExp[] = [
    /^http(s)?:\/\/(.*\.)?localhost(:[0-9]*)?(\/.*)?$/g,
    /^http(s)?:\/\/127\.0\.0\.1(:[0-9]*)?(\/.*)?$/g
  ];

  return process.env.NODE_ENV === 'production' ? allowed : [...allowed, ...dev];
};

export const corsMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
): void => {
  const origin = request.header('origin') || request.header('Origin');

  // Verificar se a origem está na whitelist
  if (origin && whitelist().some((domain) => domain.test(origin))) {
    response.set('Access-Control-Allow-Origin', origin);
    response.set('Access-Control-Allow-Credentials', 'true');
  } else if (!origin) {
    // Permitir requests sem origin (ex: mobile apps, Postman)
    response.set('Access-Control-Allow-Origin', '*');
  }

  // Métodos HTTP permitidos (mais restritivo)
  response.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );

  // Headers permitidos (mais restritivo)
  response.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Request-Id'
  );

  // Headers expostos para o frontend
  response.set(
    'Access-Control-Expose-Headers',
    'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset'
  );

  // Tempo de cache para preflight requests
  response.set('Access-Control-Max-Age', '86400'); // 24 horas

  // Responde a requisições OPTIONS com 204
  if (request.method === 'OPTIONS') {
    response.sendStatus(204);
    return;
  }

  next();
};
