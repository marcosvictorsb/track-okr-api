import { NextFunction, Request, Response } from 'express';

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

  if (origin && whitelist().some((domain) => domain.test(origin))) {
    response.set('Access-Control-Allow-Origin', origin);
    response.set('Access-Control-Allow-Credentials', 'true');
  } else if (!origin) {
    response.set('Access-Control-Allow-Origin', '*');
  }

  response.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );

  response.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Request-Id'
  );

  response.set(
    'Access-Control-Expose-Headers',
    'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset'
  );

  response.set('Access-Control-Max-Age', '86400'); // 24 horas

  if (request.method === 'OPTIONS') {
    response.sendStatus(204);
    return;
  }

  next();
};
