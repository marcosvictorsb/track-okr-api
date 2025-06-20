import { Request, Response, NextFunction } from 'express';

const whitelist = (): RegExp[] => {
  const allowed: RegExp[] = [
    /^http(s)?:\/\/(.*\.)?boilerplate.com.br(\/.*)?$/g,
    /^http(s)?:\/\/(.*\.)?gunno.com.br(\/.*)?$/g
  ];

  const dev: RegExp[] = [/^http(s)?:\/\/(.*\.)?localhost(:[0-9]*)?(\/.*)?$/g];

  return process.env.NODE_ENV === 'production' ? allowed : [...allowed, ...dev];
};

export const corsMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
): void => {
  const origin = request.header('origin') || request.header('Origin');

  if (origin && whitelist().some((domain) => domain.test(origin))) {
    response.set('Access-Control-Allow-Origin', origin);
  }

  response.set(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );
  response.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Accept, Accept-Encoding, Accept-Language, X-Access-Token, X-Key, Authorization, X-request-Id, Prefer, X-Logged-Area'
  );

  // Responde a requisições OPTIONS com 204
  if (request.method === 'OPTIONS') {
    response.sendStatus(204);
    return;
  }

  next();
};
