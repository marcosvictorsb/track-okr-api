# 🎯 Track OKR API

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT" />
</div>

<div align="center">
  <h3>🚀 API moderna para gestão de OKRs (Objectives and Key Results)</h3>
  <p>Sistema completo para gerenciamento de objetivos empresariais e acompanhamento de resultados-chave</p>
</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso da API](#-uso-da-api)
- [Documentação das Rotas](#-documentação-das-rotas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

## 🎯 Sobre o Projeto

O **Track OKR API** é uma API RESTful robusta desenvolvida para facilitar a implementação e gestão da metodologia OKR (Objectives and Key Results) em empresas de todos os tamanhos.

### 🌟 Por que usar OKRs?

- **Alinhamento organizacional**: Conecta objetivos individuais com metas da empresa
- **Transparência**: Todos sabem em que estão trabalhando e por quê
- **Foco**: Concentra esforços no que realmente importa
- **Agilidade**: Permite ajustes rápidos baseados em resultados

## ✨ Funcionalidades

### 🔐 **Autenticação & Autorização**

- ✅ Sistema JWT robusto
- ✅ Controle de acesso baseado em roles
- ✅ Validação de empresa e usuário
- ✅ Middleware de autenticação

### 🏢 **Gestão de Empresas**

- ✅ Cadastro e gerenciamento de empresas
- ✅ Controle de usuários por empresa
- ✅ Isolamento de dados por tenant

### 👥 **Gestão de Usuários**

- ✅ Cadastro e autenticação de usuários
- ✅ Diferentes níveis de permissão
- ✅ Perfis de usuário personalizáveis

### 📊 **Planejamento Anual**

- ✅ Criação de planejamentos estratégicos
- ✅ Definição de metas anuais
- ✅ Acompanhamento de progresso
- ✅ Histórico de planejamentos

### 🎯 **Gestão de Times**

- ✅ Criação e gerenciamento de equipes
- ✅ Definição de responsabilidades
- ✅ Controle de membros por time
- ✅ Métricas de performance

### 📈 **Objetivos (Objectives)**

- ✅ Criação de objetivos estratégicos
- ✅ Vinculação com planejamentos
- ✅ Acompanhamento de status

### 🔑 **Resultados-Chave (Key Results)**

- ✅ Definição de métricas mensuráveis
- ✅ Acompanhamento de progresso
- ✅ Alertas de performance

### 💰 **Sistema de Assinatura**

- ✅ Gestão de planos e assinaturas
- ✅ Controle de funcionalidades por plano
- ✅ Integração com gateway de pagamento

## 🛠 Tecnologias

### **Backend**

- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset tipado do JavaScript
- **Express.js** - Framework web minimalista
- **Sequelize** - ORM para banco de dados

### **Banco de Dados**

- **MySQL** - Banco de dados relacional principal
- **Redis** - Cache e sessões

### **Validação & Segurança**

- **Zod** - Validação de schemas TypeScript
- **JWT** - Autenticação via tokens
- **bcryptjs** - Hash de senhas

### **Ferramentas de Desenvolvimento**

- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Nodemon** - Hot reload em desenvolvimento
- **Winston** - Sistema de logs

## 🏗 Arquitetura

O projeto segue os princípios da **Clean Architecture** e **Domain Driven Design (DDD)**:

```
src/
├── 📁 adapters/          # Adaptadores externos
├── 📁 configs/           # Configurações da aplicação
├── 📁 domains/           # Lógica de negócio
│   ├── 📁 api/          # Domínios da API
│   ├── 📁 common/       # Utilitários compartilhados
│   └── 📁 webhooks/     # Processamento de webhooks
├── 📁 infra/            # Infraestrutura (DB, migrations)
├── 📁 middlewares/      # Middlewares customizados
└── 📁 protocols/        # Contratos e interfaces
```

### 🔄 Fluxo de Dados

```
Request → Router → Middleware → Controller → Interactor → Gateway → Repository → Database
```

## 🚀 Instalação

### Pré-requisitos

- Node.js (v18 ou superior)
- MySQL (v8 ou superior)
- Redis (v6 ou superior)
- npm ou yarn

### Passo a passo

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
```

4. **Execute as migrações**

```bash
npm run migration
```

5. **Inicie o servidor**

```bash
npm start
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# 🖥️ Servidor
PORT=3000
NODE_ENV=development

# 🗄️ Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_NAME=track_okr
DB_USER=root
DB_PASS=password

# 📦 Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 🔐 JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# 📧 Email (Resend)
RESEND_API_KEY=your-resend-api-key

# 💳 Pagamentos (Mercado Pago)
MP_ACCESS_TOKEN=your-mercado-pago-token
```

## 📖 Uso da API

### Base URL

```
http://localhost:3000/api
```

### Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Inclua o token no header:

```bash
Authorization: Bearer <seu-jwt-token>
```

### Exemplo de Uso

```javascript
// Login
const response = await fetch('/api/authenticate/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { token } = await response.json();

// Usar o token em requisições subsequentes
const teams = await fetch('/api/team', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

## 📚 Documentação das Rotas

### 🔐 Autenticação

```http
POST   /api/authenticate/login     # Login de usuário
POST   /api/authenticate/register  # Registro de usuário
POST   /api/authenticate/refresh   # Renovar token
```

### 👥 Usuários

```http
GET    /api/user                   # Listar usuários
POST   /api/user                   # Criar usuário
GET    /api/user/:id               # Obter usuário
PUT    /api/user/:id               # Atualizar usuário
DELETE /api/user/:id               # Deletar usuário
```

### 🎯 Times

```http
GET    /api/team                   # Listar times
POST   /api/team                   # Criar time
PUT    /api/team/:id               # Atualizar time
DELETE /api/team/:id               # Deletar time
```

### 📊 Planejamentos

```http
GET    /api/planner                # Listar planejamentos
POST   /api/planner                # Criar planejamento
PUT    /api/planner/:id            # Atualizar planejamento
DELETE /api/planner/:id            # Deletar planejamento
```

### 🔍 Health Check

```http
GET    /api/health-check           # Status da API
```

### 📋 Exemplos de Payloads

#### Criar Time

```json
{
  "name": "Time de Desenvolvimento",
  "description": "Equipe responsável pelo desenvolvimento de software",
  "amount_users": 8
}
```

#### Criar Planejamento

```json
{
  "title": "Planejamento 2025",
  "description": "Objetivos estratégicos para 2025",
  "year": 2025
}
```

## 📂 Estrutura do Projeto

```
track-okr-api/
├── 📄 README.md                    # Documentação principal
├── 📄 package.json                 # Dependências e scripts
├── 📄 tsconfig.json               # Configuração TypeScript
├── 📄 eslint.config.mjs           # Configuração ESLint
├── 📁 src/                        # Código fonte
│   ├── 📄 app.ts                  # Configuração do Express
│   ├── 📄 server.ts              # Entrada da aplicação
│   ├── 📁 adapters/              # Adaptadores externos
│   │   ├── 📁 gateways/          # Gateways para APIs externas
│   │   └── 📁 services/          # Serviços (email, crypto, etc)
│   ├── 📁 configs/               # Configurações
│   │   ├── 📄 cors.ts            # Configuração CORS
│   │   ├── 📄 logger.ts          # Configuração de logs
│   │   └── 📄 routers.ts         # Configuração de rotas
│   ├── 📁 domains/               # Domínios de negócio
│   │   ├── 📁 api/               # Lógica da API
│   │   │   ├── 📁 authentication/ # Autenticação
│   │   │   ├── 📁 companies/     # Empresas
│   │   │   ├── 📁 planners/      # Planejamentos
│   │   │   ├── 📁 teams/         # Times
│   │   │   └── 📁 users/         # Usuários
│   │   └── 📁 common/            # Utilitários compartilhados
│   ├── 📁 infra/                 # Infraestrutura
│   │   └── 📁 database/          # Configuração de banco
│   ├── 📁 middlewares/           # Middlewares customizados
│   └── 📁 protocols/             # Interfaces e contratos
└── 📁 migrations/                # Migrações do banco
```

## 🛠 Scripts Disponíveis

```bash
# 🚀 Desenvolvimento
npm start              # Inicia o servidor em modo desenvolvimento
npm run lint           # Executa linting do código
npm run format         # Formata o código com Prettier

# 🗄️ Banco de Dados
npm run migration      # Executa migrações pendentes
npm run migration:create -- --name nome-da-migration  # Cria nova migração
```

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Siga estes passos:

### 1. Fork o projeto

```bash
git clone https://github.com/seu-usuario/track-okr-api.git
```

### 2. Crie uma branch para sua feature

```bash
git checkout -b feature/nova-funcionalidade
```

### 3. Commit suas mudanças

```bash
git commit -m "feat: adiciona nova funcionalidade"
```

### 4. Push para a branch

```bash
git push origin feature/nova-funcionalidade
```

### 5. Abra um Pull Request

### 📝 Padrões de Commit

Utilizamos [Conventional Commits](https://conventionalcommits.org/):

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `style:` formatação
- `refactor:` refatoração
- `test:` testes
- `chore:` tarefas de build/config

## 📄 Licença

Este projeto está sob a licença **ISC**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">
  <p>Desenvolvido com ❤️ por <a href="https://github.com/marcosvictorsb">Marcos Victor</a></p>
  
  <p>
    <a href="https://github.com/marcosvictorsb/track-okr-api/issues">🐛 Reportar Bug</a> •
    <a href="https://github.com/marcosvictorsb/track-okr-api/issues">💡 Solicitar Feature</a> •
    <a href="https://github.com/marcosvictorsb/track-okr-api">⭐ Dar uma Estrela</a>
  </p>
</div>
