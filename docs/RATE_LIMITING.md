# Rate Limiting Configuration

Este documento descreve as configurações de rate limiting implementadas na API Track OKR para proteger contra ataques de força bruta, spam e uso abusivo dos recursos.

## Configurações Implementadas

### 1. Global Limiter (`globalLimiter`)

- **Janela**: 15 minutos
- **Limite**: 300 requests por IP
- **Uso**: Aplicado globalmente via middleware
- **Justificativa**: Limite generoso para permitir uso normal de SaaS multi-tenant

### 2. Authentication Limiter (`authLimiter`)

- **Janela**: 15 minutos
- **Limite**: 10 tentativas de login por IP
- **Uso**: Endpoints de autenticação
- **Características**: Não conta requests bem-sucedidos
- **Justificativa**: Proteção contra ataques de força bruta em login

### 3. Upload Limiter (`uploadLimiter`)

- **Janela**: 10 minutos
- **Limite**: 15 uploads por IP
- **Uso**: Endpoints de upload (perfil/avatar)
- **Justificativa**: Permite uploads normais enquanto previne spam de arquivos

### 4. User Creation Limiter (`userCreationLimiter`)

- **Janela**: 10 minutos
- **Limite**: 10 criações de usuário por IP
- **Uso**: Endpoint `/users/invite`
- **Justificativa**: Previne criação massiva de contas spam

### 5. Objective Creation Limiter (`objectiveCreationLimiter`)

- **Janela**: 5 minutos
- **Limite**: 50 objetivos por IP
- **Uso**: Endpoint `POST /objectives`
- **Justificativa**: Permite criação em lote de objetivos em setup inicial

### 6. Key Result Creation Limiter (`keyResultCreationLimiter`)

- **Janela**: 5 minutos
- **Limite**: 100 resultados-chave por IP
- **Uso**: Endpoint `POST /results-keys`
- **Justificativa**: Cada objetivo pode ter múltiplos resultados-chave

### 7. Key Result Update Limiter (`keyResultUpdateLimiter`)

- **Janela**: 5 minutos
- **Limite**: 200 updates por IP
- **Uso**: Endpoint `POST /results-keys/:id/updates`
- **Justificativa**: Permite atualizações frequentes de progresso

### 8. Generic Create Limiter (`createLimiter`)

- **Janela**: 5 minutos
- **Limite**: 30 criações por IP
- **Uso**: Fallback para outros endpoints de criação
- **Justificativa**: Proteção geral para novos endpoints

## Aplicação nos Endpoints

### Objectives

```typescript
// POST /objectives
authMiddleware -> objectiveCreationLimiter -> validation -> controller
```

### Results Keys

```typescript
// POST /results-keys
authMiddleware -> keyResultCreationLimiter -> validation -> controller

// POST /results-keys/:id/updates
authMiddleware -> keyResultUpdateLimiter -> validation -> controller
```

### Users

```typescript
// POST /users/invite
authMiddleware -> userCreationLimiter -> validation -> controller
```

### Profile

```typescript
// PUT /profile
authMiddleware -> uploadLimiter -> createLimiter -> fileValidation -> controller
```

## Considerações para SaaS Multi-Tenant

### Limites Ajustados para SaaS

- **Global**: Aumentado de 100 para 300 requests por 15min
- **Auth**: Aumentado de 5 para 10 tentativas por 15min
- **Upload**: Aumentado de 10 para 15 uploads por 10min
- **Create**: Aumentado de 20 para 30 criações por 5min

### Cenários Típicos de Uso

1. **Setup Inicial**: Empresa criando múltiplos objetivos e resultados-chave
2. **Uso Diário**: Updates frequentes de progresso
3. **Onboarding**: Convite de múltiplos usuários
4. **Integração**: APIs criando objetivos em lote

### Monitoramento Recomendado

1. **Headers HTTP**: Rate limit info nos response headers
2. **Logs**: Requests bloqueados por rate limiting
3. **Métricas**: Uso por endpoint e janela de tempo
4. **Alertas**: Quando limites são atingidos frequentemente

## Headers de Resposta

Todos os rate limiters retornam headers padrão:

- `RateLimit-Limit`: Limite total da janela
- `RateLimit-Remaining`: Requests restantes
- `RateLimit-Reset`: Timestamp do reset da janela

## Configuração Avançada (Futuro)

### Rate Limiting por Tenant

```typescript
// Exemplo para implementação futura
const tenantAwareLimiter = rateLimit({
  keyGenerator: (req) => `${req.ip}:${req.user.companyId}`
  // ... outras configurações
});
```

### Rate Limiting por Usuário

```typescript
// Exemplo para limitação por usuário específico
const userAwareLimiter = rateLimit({
  keyGenerator: (req) => `user:${req.user.id}`
  // ... outras configurações
});
```

## Troubleshooting

### Limite Atingido

- Verifique se o uso está dentro do esperado
- Considere ajustar limites se necessário
- Implemente retry com backoff no frontend

### Performance

- Rate limiting é aplicado em memória (rápido)
- Para clusters, considere Redis como store
- Monitore CPU/memória do servidor

### Bypass para Testes

```typescript
// Para ambiente de desenvolvimento/teste
const limiter =
  process.env.NODE_ENV === 'test' ? (req, res, next) => next() : actualLimiter;
```
