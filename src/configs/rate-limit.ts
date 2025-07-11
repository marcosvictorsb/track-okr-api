import rateLimit from 'express-rate-limit';

// Rate limiting global (mais generoso para SaaS multi-tenant)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // máximo 300 requests por IP por janela (aumentado para SaaS)
  message: {
    error: 'Muitas tentativas, tente novamente mais tarde',
    retryAfter: '15 minutos'
  },
  standardHeaders: true, // Retorna rate limit info nos headers
  legacyHeaders: false // Desabilita headers X-RateLimit-*
});

// Rate limiting para autenticação (mais restritivo)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 tentativas de login por IP (aumentado ligeiramente)
  message: {
    error: 'Muitas tentativas de login, tente novamente em 15 minutos',
    retryAfter: '15 minutos'
  },
  skipSuccessfulRequests: true, // Não conta requests bem-sucedidos
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para upload de arquivos
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 15, // máximo 15 uploads por IP (aumentado para perfis/avatares)
  message: {
    error: 'Muitos uploads, tente novamente mais tarde',
    retryAfter: '10 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para criação de usuários (mais restritivo para prevenir spam)
export const userCreationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 10, // máximo 10 criações de usuário por IP
  message: {
    error: 'Muitas criações de usuário, tente novamente mais tarde',
    retryAfter: '10 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para criação de objetivos (mais generoso para uso normal de OKR)
export const objectiveCreationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 50, // máximo 50 objetivos por IP (permite criação em lote)
  message: {
    error: 'Muitas criações de objetivos, tente novamente mais tarde',
    retryAfter: '5 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para criação de resultados-chave (bem generoso pois são muitos por objetivo)
export const keyResultCreationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 100, // máximo 100 resultados-chave por IP (cada objetivo pode ter vários)
  message: {
    error: 'Muitas criações de resultados-chave, tente novamente mais tarde',
    retryAfter: '5 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para updates de resultados-chave (muito generoso para progresso diário)
export const keyResultUpdateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 200, // máximo 200 updates por IP (progresso frequente)
  message: {
    error: 'Muitas atualizações de progresso, tente novamente mais tarde',
    retryAfter: '5 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para criação de recursos gerais (fallback)
export const createLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 30, // máximo 30 criações por IP (aumentado de 20)
  message: {
    error: 'Muitas operações de criação, tente novamente mais tarde',
    retryAfter: '5 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false
});
