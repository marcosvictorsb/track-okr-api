# 🎯 Track OKR API

<div align="center">
   <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT" />
  
  <h3>🚀 API RESTful moderna para gestão de OKRs (Objectives and Key Results)</h3>
  <p>Sistema completo e escalável para gerenciamento de objetivos empresariais, acompanhamento de resultados-chave e evolução de performance organizacional</p>
  
  [![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](package.json)
  [![License](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)
  
</div>

---

## 🔍 RESUMO DA ANÁLISE

- **Tipo de projeto:** API RESTful / Backend Web Application
- **Linguagem principal:** TypeScript 5.8.3
- **Framework principal:** Express.js 4.19.2
- **Arquitetura:** Clean Architecture + Domain Driven Design (DDD)
- **Banco de dados:** MySQL (Sequelize ORM) + Redis (Cache)
- **Arquivos analisados:** 200+ arquivos em múltiplas pastas
- **Pontos de entrada identificados:**
  - `src/server.ts` - Servidor HTTP principal
  - `src/app.ts` - Configuração da aplicação Express
- **Dependências principais:**
  - Express, Sequelize, MySQL2, Redis (IORedis)
  - JWT (jsonwebtoken), Bcrypt, Zod
  - Winston (Logs), OpenSearch, Prometheus
  - Axios, Resend (Email), Multer (Upload)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Começando Rápido](#-começando-rápido)
- [Configuração](#%EF%B8%8F-configuração)
- [Uso](#-uso)
- [Arquitetura](#%EF%B8%8F-arquitetura)
- [Testes](#-testes)
- [Desenvolvimento](#-desenvolvimento)
- [Deploy](#-deploy)
- [Tecnologias](#%EF%B8%8F-tecnologias)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

O **Track OKR API** é uma API RESTful enterprise-grade desenvolvida para facilitar a implementação e gestão da metodologia OKR (Objectives and Key Results) em empresas de todos os tamanhos. A plataforma oferece um sistema completo de planejamento estratégico, gestão de objetivos, acompanhamento de performance e dashboard analítico.

### 🌟 Por que usar OKRs?

- **Alinhamento Organizacional**: Conecta objetivos individuais com metas da empresa
- **Transparência Total**: Todos sabem em que estão trabalhando e por quê
- **Foco Estratégico**: Concentra esforços no que realmente importa
- **Agilidade**: Permite ajustes rápidos baseados em resultados medidos
- **Métricas Quantificáveis**: Acompanhamento preciso de progresso

---

## ✨ Funcionalidades Principais

### 🔐 **Autenticação & Autorização**

- ✅ Sistema JWT robusto com refresh tokens
- ✅ Controle de acesso baseado em roles e permissões
- ✅ Arquitetura multi-tenant (isolamento por empresa)
- ✅ Middleware de autenticação avançado

### 🏢 **Gestão de Empresas & Usuários**

- ✅ Cadastro e gerenciamento de empresas (companies)
- ✅ Gestão completa de usuários com diferentes níveis de acesso
- ✅ Perfis de usuário personalizáveis
- ✅ Sistema de avatars com upload de imagens

### 📊 **Planejamento Estratégico**

- ✅ Criação de planejamentos anuais (planners)
- ✅ Definição de metas organizacionais por período
- ✅ Acompanhamento de progresso temporal
- ✅ Histórico completo de planejamentos

### 🎯 **Objetivos & Resultados-Chave**

- ✅ Criação e gestão de objetivos (objectives)
- ✅ Definição de resultados-chave mensuráveis (key results)
- ✅ Sistema de check-ins periódicos
- ✅ Vinculação de objetivos a times e responsáveis
- ✅ Acompanhamento de status e progresso

### 👥 **Gestão de Times**

- ✅ Criação e gerenciamento de equipes
- ✅ Atribuição de membros aos times
- ✅ Métricas de performance por time
- ✅ Organização hierárquica

### 📈 **Dashboard & Analytics**

- ✅ Dashboard centralizado com métricas consolidadas
- ✅ Visão anual de evolução de OKRs
- ✅ Análise de performance por período (mensal/semanal)
- ✅ Check-ins recentes e histórico
- ✅ Insights de progresso e tendências

### 💰 **Sistema de Assinatura & Permissões**

- ✅ Gestão de planos e assinaturas
- ✅ Controle de funcionalidades por plano
- ✅ Limites de recursos baseados em assinatura
- ✅ API de permissões para frontend

### 🎫 **Backoffice Administrativo**

- ✅ Interface administrativa separada
- ✅ Gestão de planos e empresas
- ✅ Sistema de autenticação dedicado
- ✅ Dashboard de administração

### 📧 **Comunicação & Notificações**

- ✅ Sistema de email (Resend integration)
- ✅ Webhooks para integrações externas
- ✅ Notificações via Discord
- ✅ Landing page para captura de leads

### 🛡️ **Segurança & Monitoramento**

- ✅ Rate limiting avançado
- ✅ Helmet.js para security headers
- ✅ Sanitização de inputs (mongo-sanitize)
- ✅ Sistema de logs com Winston
- ✅ Integração com OpenSearch para logs centralizados
- ✅ Métricas Prometheus
- ✅ Health checks automatizados

---

## 🚀 Começando Rápido

### 📋 Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

- **Node.js** `>= 18.x` (recomendado v23.6.1)
- **MySQL** `>= 8.x`
- **Redis** `>= 6.x`
- **npm** ou **yarn**
- **PM2** (opcional, para produção)

### 📥 Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/marcosvictorsb/track-okr-api.git
cd track-okr-api
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Configure o banco de dados**

```bash
# Execute as migrações
npm run migration

# (Opcional) Execute os seeds para dados de exemplo
npm run seed
```

5. **Inicie o servidor em desenvolvimento**

```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`

### ⚡ Setup Rápido para Desenvolvimento

```bash
# Comando único que instala, configura e inicia
npm run setup:dev
```

---

## ⚙️ Configuração

### 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```env
# 🖥️ Configurações do Servidor
PORT=3000
NODE_ENV=development

# 🗄️ Configurações do Banco de Dados MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=track_okr
DB_USER=root
DB_PASS=your_mysql_password

# 📦 Configurações do Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 🔐 Configurações JWT
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure
JWT_EXPIRES_IN=7d

# 📧 Configurações de Email (Resend)
RESEND_API_KEY=your-resend-api-key-here

# 💳 Configurações de Pagamento (Mercado Pago)
MP_ACCESS_TOKEN=your-mercado-pago-access-token-here

# 🔍 Configurações de Log
LOG_LEVEL=info

# 🔍 Configurações do OpenSearch (Produção)
OPENSEARCH_URL=https://your-opensearch-cluster.com:9200
OPENSEARCH_USERNAME=admin
OPENSEARCH_PASSWORD=your-opensearch-password
OPENSEARCH_INDEX=track-okr-logs
OPENSEARCH_SSL_VERIFY=true
```

### 🔍 Verificação de Variáveis

O projeto inclui um script de verificação automática:

```bash
npm run check-env
```

Este comando verifica se todas as variáveis de ambiente necessárias estão configuradas antes do build.

---

## 🎯 Uso

### 📡 Endpoints Principais

A API está organizada nos seguintes módulos:

#### **Autenticação**

```
POST   /authenticate/login
POST   /authenticate/register
POST   /authenticate/refresh-token
POST   /authenticate/logout
```

#### **Usuários**

```
GET    /users
POST   /users
GET    /users/:id
PUT    /users/:id
DELETE /users/:id
POST   /users/:id/activate
```

#### **Planejadores**

```
GET    /planners
POST   /planners
GET    /planners/:id
PUT    /planners/:id
DELETE /planners/:id
```

#### **Objetivos**

```
GET    /objectives
POST   /objectives
GET    /objectives/:id
PUT    /objectives/:id
DELETE /objectives/:id
```

#### **Resultados-Chave**

```
GET    /key-results
POST   /key-results
GET    /key-results/:id
PUT    /key-results/:id
DELETE /key-results/:id
```

#### **Check-ins**

```
GET    /checkins
POST   /checkins
GET    /checkins/:id
PUT    /checkins/:id
```

#### **Dashboard**

```
GET    /dashboard/overview
GET    /dashboard/metrics
GET    /dashboard/team-performance
GET    /dashboard/recent-checkins
```

#### **Evolução**

```
GET    /evolution?year=2025&granularity=monthly
GET    /evolution/key-result/:id/period/:period
```

#### **Times**

```
GET    /teams
POST   /teams
GET    /teams/:id
PUT    /teams/:id
DELETE /teams/:id
```

#### **Permissões**

```
GET    /permissions/company/:id_company
```

#### **Assinatura**

```
GET    /subscription/plans
POST   /subscription/subscribe
GET    /subscription/status
```

#### **Backoffice**

```
POST   /backoffice/auth/login
GET    /backoffice/dashboard
GET    /backoffice/companies
GET    /backoffice/plans
```

#### **Suporte & Informações**

```
POST   /support-contact
GET    /informations
POST   /leads
```

#### **Health Check**

```
GET    /health-check
GET    /api/health
GET    /metrics (Prometheus)
```

### 📖 Exemplo de Requisição

```bash
# Login
curl -X POST http://localhost:3000/authenticate/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "password": "senha123"
  }'

# Criar Objetivo (requer token JWT)
curl -X POST http://localhost:3000/objectives \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "title": "Aumentar receita em 30%",
    "description": "Objetivo estratégico Q1",
    "planner_id": 1,
    "team_id": 2
  }'
```

### 🛠️ Comandos Disponíveis

```bash
# Desenvolvimento
npm start              # Inicia servidor com hot-reload
npm run build          # Compila TypeScript para JavaScript
npm run lint           # Executa ESLint
npm run format         # Formata código com Prettier

# Testes
npm test               # Executa testes em modo watch
npm run test:run       # Executa testes uma vez
npm run test:coverage  # Gera relatório de cobertura

# Banco de Dados
npm run migration              # Executa migrações
npm run migration:create       # Cria nova migração
npm run seed                   # Executa seeds
npm run seed:create            # Cria novo seed

# Produção (PM2)
npm run pm2:start              # Inicia com PM2 (dev)
npm run pm2:start:prod         # Inicia com PM2 (production)
npm run pm2:stop               # Para aplicação
npm run pm2:restart            # Reinicia aplicação
npm run pm2:logs               # Visualiza logs

# Utilitários
npm run check-env      # Verifica variáveis de ambiente
npm run setup:dev      # Setup completo de desenvolvimento
```

---

## 🏗️ Arquitetura

O projeto segue os princípios da **Clean Architecture** e **Domain Driven Design (DDD)**, garantindo:

- ✅ Separação clara de responsabilidades
- ✅ Independência de frameworks
- ✅ Testabilidade
- ✅ Manutenibilidade
- ✅ Escalabilidade

### 📁 Estrutura do Projeto

```
track-okr-api/
├── 📂 src/
│   ├── 📂 @types/              # Definições de tipos TypeScript
│   │   └── express/            # Extensões de tipos do Express
│   │
│   ├── 📂 adapters/            # Adaptadores externos
│   │   ├── gateways/           # Integrações com serviços externos
│   │   │   ├── api/            # Gateways de APIs externas
│   │   │   ├── common/         # Gateways compartilhados
│   │   │   ├── permissions/    # Gateway de permissões
│   │   │   └── webhook/        # Gateway de webhooks
│   │   └── services/           # Serviços auxiliares
│   │       ├── backoffice-jwt.service.ts
│   │       ├── discord-notification.service.ts
│   │       ├── email.service.ts
│   │       ├── encryption.service.ts
│   │       ├── image.processing.service.ts
│   │       ├── logger.service.ts
│   │       ├── memory.optimization.service.ts
│   │       └── token.service.ts
│   │
│   ├── 📂 configs/             # Configurações da aplicação
│   │   ├── async.context.ts    # Contexto assíncrono (AsyncLocalStorage)
│   │   ├── cors.ts             # Configuração CORS
│   │   ├── error-handling.ts   # Tratamento de erros
│   │   ├── logger.ts           # Sistema de logs (Winston)
│   │   ├── prometheus.ts       # Métricas Prometheus
│   │   ├── rate-limit.ts       # Rate limiting
│   │   ├── routers.ts          # Configuração de rotas
│   │   └── security.ts         # Configurações de segurança
│   │
│   ├── 📂 domains/             # Lógica de negócio (DDD)
│   │   ├── 📂 api/             # Domínios da API
│   │   │   ├── authentication/ # Autenticação e autorização
│   │   │   ├── backoffice/     # Administração backoffice
│   │   │   ├── checkins/       # Check-ins de resultados
│   │   │   ├── companies/      # Gestão de empresas
│   │   │   ├── dashboard/      # Dashboard e métricas
│   │   │   ├── evolution/      # Evolução de OKRs
│   │   │   ├── health/         # Health checks
│   │   │   ├── information/    # Informações gerais
│   │   │   ├── landing-page-leads/ # Captação de leads
│   │   │   ├── objectives/     # Gestão de objetivos
│   │   │   ├── permissions/    # Sistema de permissões
│   │   │   ├── planners/       # Planejamentos anuais
│   │   │   ├── profile/        # Perfil de usuário
│   │   │   ├── results-keys/   # Resultados-chave
│   │   │   ├── settings/       # Configurações
│   │   │   ├── subscription/   # Assinaturas e planos
│   │   │   ├── support-contact/ # Suporte
│   │   │   ├── teams/          # Gestão de times
│   │   │   └── users/          # Gestão de usuários
│   │   ├── 📂 common/          # Domínios compartilhados
│   │   └── 📂 webhooks/        # Processamento de webhooks
│   │       └── cakto/          # Webhook Cakto
│   │
│   ├── 📂 infra/               # Infraestrutura
│   │   └── database/           # Configurações de banco de dados
│   │       ├── config/         # Configuração Sequelize
│   │       ├── connection/     # Conexões
│   │       ├── migrations/     # Migrações SQL
│   │       ├── models/         # Modelos Sequelize
│   │       └── seeders/        # Seeds de dados
│   │
│   ├── 📂 middlewares/         # Middlewares customizados
│   │   ├── auth.jwt.middlewares.ts
│   │   ├── backoffice-auth.middleware.ts
│   │   ├── file-validation.middleware.ts
│   │   ├── prometheus.middleware.ts
│   │   ├── request-logging.middleware.ts
│   │   ├── upload.middleware.ts
│   │   └── validate.schema.ts
│   │
│   ├── 📂 protocols/           # Contratos e interfaces
│   │   └── http.ts
│   │
│   ├── 📂 shared/              # Utilitários compartilhados
│   │   └── utils/
│   │
│   ├── 📂 templates/           # Templates (emails, etc)
│   │
│   ├── 📂 test/                # Testes unitários e integração
│   │   └── unit/
│   │       └── api/
│   │
│   ├── 📄 app.ts               # Configuração do Express
│   └── 📄 server.ts            # Ponto de entrada da aplicação
│
├── 📂 coverage/                # Relatórios de cobertura de testes
├── 📂 deployment/              # Configurações de deploy
│   ├── ecosystem.config.json           # PM2 config (dev)
│   ├── ecosystem.production.json       # PM2 config (prod)
│   ├── ecosystem.demo.json             # PM2 config (demo)
│   ├── nginx-production.conf           # Nginx config (prod)
│   ├── nginx-demo.conf                 # Nginx config (demo)
│   └── nginx-rate-limiting.conf        # Nginx rate limiting
│
├── 📂 docs/                    # Documentação técnica
│   ├── README.md                       # Documentação Evolution
│   ├── API_EVOLUCAO_OKRS.md
│   ├── PERMISSIONS_API.md
│   ├── SETTINGS_API_DOCUMENTATION.md
│   ├── PROCESSAMENTO_CHECKINS.md
│   ├── ESTRATEGIA_PRECOS_REFORMULADA.md
│   └── bakoffice/              # Docs do backoffice
│
├── 📂 logs/                    # Arquivos de log
├── 📂 monitoring/              # Configurações de monitoramento
├── 📂 scripts/                 # Scripts utilitários
│   └── check-env-vars.js       # Verificação de variáveis
├── 📂 uploads/                 # Upload de arquivos
│   └── avatars/
│
├── 📄 .env.example             # Exemplo de variáveis de ambiente
├── 📄 eslint.config.mjs        # Configuração ESLint
├── 📄 package.json             # Dependências e scripts
├── 📄 tsconfig.json            # Configuração TypeScript
├── 📄 vitest.config.ts         # Configuração de testes
└── 📄 README.md                # Este arquivo
```

### 🔄 Fluxo de Dados (Clean Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                         HTTP REQUEST                             │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│  ROUTER (src/configs/routers.ts)                                │
│  • Define rotas e agrupa endpoints                               │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│  MIDDLEWARES                                                     │
│  • Auth JWT (auth.jwt.middlewares.ts)                           │
│  • Validation (validate.schema.ts)                              │
│  • Rate Limiting (rate-limit.ts)                                │
│  • Security (security.ts, helmet)                               │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│  CONTROLLER (domains/*/controllers/)                            │
│  • Recebe requisição HTTP                                       │
│  • Valida entrada                                               │
│  • Chama Use Case (Interactor)                                  │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│  INTERACTOR/USE CASE (domains/*/usecases/)                      │
│  • Contém lógica de negócio                                     │
│  • Orquestra operações                                          │
│  • Chama Gateways e Repositories                                │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│  GATEWAY (domains/*/gateways/)                                  │
│  • Interface com repositórios                                   │
│  • Busca e transforma dados                                     │
│  • Integração com serviços externos                             │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│  REPOSITORY (domains/*/repository/)                             │
│  • Acesso ao banco de dados                                     │
│  • Operações CRUD                                               │
│  • Queries complexas                                            │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│  DATABASE (MySQL + Redis)                                       │
│  • Persistência de dados                                        │
│  • Cache                                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 🎯 Estrutura de um Domínio

Cada domínio segue a mesma estrutura padronizada:

```
domains/api/[nome-dominio]/
├── 📂 controllers/     # Controladores HTTP
├── 📂 entity/          # Entidades e interfaces TypeScript
├── 📂 factories/       # Factories para injeção de dependência
├── 📂 gateways/        # Gateways de acesso a dados
├── 📂 interfaces/      # Contratos e interfaces
├── 📂 model/           # Modelos Sequelize
├── 📂 repository/      # Repositórios de dados
├── 📂 routers/         # Definição de rotas
├── 📂 schemas/         # Schemas de validação (Zod)
└── 📂 usecases/        # Regras de negócio (Interactors)
```

---

## 🧪 Testes

O projeto utiliza **Vitest** como framework de testes com suporte a cobertura de código.

### 🎯 Executar Testes

```bash
# Modo watch (desenvolvimento)
npm test

# Executar uma vez
npm run test:run

# Com cobertura de código
npm run test:coverage

# Abrir relatório de cobertura no navegador
npm run coverage:html
```

### 📊 Cobertura de Testes

A configuração de testes foca na pasta `src/domains/**` para métricas de cobertura:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/domains/**/*.ts'],
      reporter: ['text', 'json', 'html', 'lcov']
    }
  }
});
```

### 📝 Exemplo de Teste

```typescript
// src/test/unit/api/users/controllers/active.user.controller.test.ts
import { describe, expect, it, beforeEach, vi } from 'vitest';

describe('ActivateUserController', () => {
  it('should activate user successfully', async () => {
    // Arrange
    const userId = 1;

    // Act
    const result = await controller.activate(userId);

    // Assert
    expect(result.success).toBe(true);
  });
});
```

---

## 🔧 Desenvolvimento

### 🛠️ Setup de Desenvolvimento

```bash
# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
# Edite .env com suas configurações

# Setup completo (instala + migra + inicia)
npm run setup:dev
```

### 📝 Padrões de Código

O projeto utiliza **ESLint** e **Prettier** para garantir qualidade e consistência:

```bash
# Verificar erros de lint
npm run lint

# Formatar código automaticamente
npm run format
```

### 🏗️ Build

```bash
# Build de produção
npm run build

# Verificar variáveis antes do build
npm run pre-build

# Output: dist/
```

O build compila TypeScript para JavaScript e resolve os aliases de caminho:

```json
{
  "scripts": {
    "build": "npm run pre-build && tsc && tsc-alias"
  }
}
```

### 🔄 Hot Reload

O servidor em desenvolvimento usa **nodemon** para hot reload automático:

```bash
npm start
# Observa: src/**/*.ts
# Reinicia automaticamente ao detectar mudanças
```

### 🐛 Debug

Para debug, você pode usar o VS Code com a seguinte configuração:

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Track OKR API",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["start"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

---

## 📦 Deploy

### 🚀 Deploy com PM2 (Recomendado)

O projeto inclui configurações PM2 para diferentes ambientes:

#### **Desenvolvimento**

```bash
npm run pm2:start
# Usa: deployment/ecosystem.config.json
```

#### **Produção**

```bash
npm run pm2:start:prod
# Usa: deployment/ecosystem.production.json
# Requer: Verificação de env vars + build
```

#### **Demo**

```bash
npm run pm2:start:demo
# Usa: deployment/ecosystem.demo.json
```

#### **Comandos PM2**

```bash
npm run pm2:stop       # Para aplicação
npm run pm2:restart    # Reinicia
npm run pm2:reload     # Reload sem downtime
npm run pm2:delete     # Remove do PM2
npm run pm2:logs       # Visualiza logs
npm run pm2:status     # Status da aplicação
```

### 🌐 Configuração Nginx

O projeto inclui configurações Nginx otimizadas:

#### **Produção** (`deployment/nginx-production.conf`)

```nginx
server {
    listen 443 ssl http2;
    server_name www.gunno.com.br;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/www.gunno.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.gunno.com.br/privkey.pem;

    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### **Rate Limiting** (`deployment/nginx-rate-limiting.conf`)

- Proteção contra DDoS
- Limites por IP
- Configurações específicas por endpoint

### 📊 Monitoramento

#### **Prometheus Metrics**

```bash
# Métricas disponíveis em:
GET http://localhost:3000/metrics
```

#### **Health Check**

```bash
# Verificação de saúde:
GET http://localhost:3000/health
GET http://localhost:3000/health-check
```

#### **Logs**

- **Winston** para logging estruturado
- **OpenSearch** para logs centralizados em produção
- Logs salvos em: `logs/`

### 🔒 Checklist de Deploy

- [ ] Configurar variáveis de ambiente (`.env`)
- [ ] Executar migrações de banco de dados
- [ ] Configurar SSL/TLS (Let's Encrypt)
- [ ] Configurar Nginx como reverse proxy
- [ ] Configurar PM2 para auto-restart
- [ ] Configurar backup automático do banco
- [ ] Configurar monitoramento (Prometheus + OpenSearch)
- [ ] Configurar rate limiting
- [ ] Testar health checks
- [ ] Configurar CI/CD (se aplicável)

---

## 🛠️ Tecnologias

### **Core**

| Tecnologia                                                                                               | Versão | Descrição                     |
| -------------------------------------------------------------------------------------------------------- | ------ | ----------------------------- |
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)        | v18+   | Runtime JavaScript            |
| ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) | 5.8.3  | Superset tipado do JavaScript |
| ![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)          | 4.19.2 | Framework web minimalista     |

### **Banco de Dados**

| Tecnologia                                                                                            | Versão        | Descrição                 |
| ----------------------------------------------------------------------------------------------------- | ------------- | ------------------------- |
| ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)             | 3.14.1        | Banco de dados relacional |
| ![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=flat&logo=sequelize&logoColor=white) | 6.37.7        | ORM para Node.js          |
| ![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)             | IORedis 5.6.1 | Cache e sessões           |

### **Segurança & Validação**

| Tecnologia                                                                                    | Versão  | Descrição                       |
| --------------------------------------------------------------------------------------------- | ------- | ------------------------------- |
| ![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white) | 9.0.2   | Autenticação via tokens         |
| **Zod**                                                                                       | 3.25.28 | Validação de schemas TypeScript |
| **bcryptjs**                                                                                  | 3.0.2   | Hash de senhas                  |
| **Helmet**                                                                                    | 8.1.0   | Security headers                |
| **express-mongo-sanitize**                                                                    | 2.2.0   | Proteção contra NoSQL injection |
| **express-rate-limit**                                                                        | 7.5.1   | Rate limiting                   |

### **Observabilidade & Logs**

| Tecnologia                                                                                               | Versão             | Descrição          |
| -------------------------------------------------------------------------------------------------------- | ------------------ | ------------------ |
| **Winston**                                                                                              | 3.17.0             | Sistema de logs    |
| ![OpenSearch](https://img.shields.io/badge/OpenSearch-005EB8?style=flat&logo=opensearch&logoColor=white) | 3.5.1              | Logs centralizados |
| ![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=flat&logo=prometheus&logoColor=white) | prom-client 15.1.3 | Métricas           |

### **Comunicação & Integração**

| Tecnologia | Versão | Descrição          |
| ---------- | ------ | ------------------ |
| **Axios**  | 1.11.0 | Cliente HTTP       |
| **Resend** | 4.6.0  | Serviço de email   |
| **Multer** | 2.0.1  | Upload de arquivos |

### **Desenvolvimento & Testes**

| Tecnologia                                                                                   | Versão | Descrição            |
| -------------------------------------------------------------------------------------------- | ------ | -------------------- |
| ![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat&logo=vitest&logoColor=white) | 3.1.4  | Framework de testes  |
| **ESLint**                                                                                   | 9.27.0 | Linting de código    |
| **Prettier**                                                                                 | 3.5.3  | Formatação de código |
| **Nodemon**                                                                                  | 3.1.10 | Hot reload           |
| **ts-node**                                                                                  | 10.9.2 | Execução TypeScript  |

### **Deploy & Infraestrutura**

| Tecnologia       | Descrição                     |
| ---------------- | ----------------------------- |
| **PM2**          | Process manager para Node.js  |
| **Nginx**        | Reverse proxy e load balancer |
| **module-alias** | Aliases de importação         |

---

## 📞 Contato & Suporte

### 🔗 Links Úteis

- **Repositório:** [github.com/marcosvictorsb/track-okr-api](https://github.com/marcosvictorsb/track-okr-api)
- **Issues:** [github.com/marcosvictorsb/track-okr-api/issues](https://github.com/marcosvictorsb/track-okr-api/issues)
- **Website:** [www.gunno.io](https://www.gunno.io)

### 🐛 Reportar Problemas

Se encontrar algum problema, por favor [abra uma issue](https://github.com/marcosvictorsb/track-okr-api/issues/new) com:

- Descrição detalhada
- Logs relevantes
- Ambiente (SO, Node version, etc)

---

<div align="center">
  
  **Desenvolvido com ❤️ para gestão eficiente de OKRs**
  
  ⭐ Se este projeto foi útil, considere dar uma estrela no repositório!
  
  [⬆ Voltar ao topo](#-track-okr-api)
  
</div>
