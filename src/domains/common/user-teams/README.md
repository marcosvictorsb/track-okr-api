# User Teams CRUD - Sistema de Relacionamento Usuário-Time

Este módulo implementa o CRUD completo para gerenciar o relacionamento entre usuários e times na plataforma de OKR.

## Estrutura de Arquivos

```
src/domains/api/user-teams/
├── controllers/           # Controllers para receber requests HTTP
│   ├── create.user-team.controller.ts
│   ├── get.user-team.controller.ts
│   ├── update.user-team.controller.ts
│   ├── delete.user-team.controller.ts
│   └── index.ts
├── entity/               # Entidade de domínio
│   └── user-team.entity.ts
├── factories/            # Factories para injeção de dependência
│   ├── create.user-team.factory.ts
│   ├── get.user-team.factory.ts
│   ├── update.user-team.factory.ts
│   ├── delete.user-team.factory.ts
│   └── index.ts
├── gateways/            # Gateways para acesso a dados
│   ├── create.user-team.gateway.ts
│   ├── get.user-team.gateway.ts
│   ├── update.user-team.gateway.ts
│   ├── delete.user-team.gateway.ts
│   └── index.ts
├── interfaces/          # Interfaces e tipos
│   ├── default.interfaces.ts
│   ├── create.user-team.interface.ts
│   ├── get.user-team.interface.ts
│   ├── update.user-team.interface.ts
│   ├── delete.user-team.interface.ts
│   └── index.ts
├── model/               # Modelo Sequelize
│   └── user-team.model.ts
├── repository/          # Repository para acesso a dados
│   └── user-team.repository.ts
├── routers/             # Definição de rotas Express
│   └── index.ts
├── schemas/             # Schemas de validação Zod
│   ├── create.user-team.schema.ts
│   ├── update.user-team.schema.ts
│   └── index.ts
└── usecases/            # Casos de uso/Interactors
    ├── create.user-team.interactor.ts
    ├── get.user-team.interactor.ts
    ├── update.user-team.interactor.ts
    ├── delete.user-team.interactor.ts
    └── index.ts
```

## Funcionalidades Implementadas

### 1. CREATE - Adicionar Usuário ao Time

- **Endpoint**: `POST /user-teams`
- **Descrição**: Adiciona um usuário a um time específico
- **Validações**:
  - Usuário requisitante deve ter permissão para gerenciar o time
  - Usuário a ser adicionado deve existir na mesma empresa
  - Time deve existir na mesma empresa
  - Usuário não pode estar já no time
- **Campos**:
  - `id_user_to_add`: ID do usuário a ser adicionado
  - `id_team`: ID do time
  - `role_in_team`: Cargo no time (opcional, padrão: 'member')

### 2. READ - Buscar Relacionamentos

- **Endpoints**:
  - `GET /user-teams` - Busca geral com filtros
  - `GET /user-teams/team/:id_team` - Usuários de um time
  - `GET /user-teams/user/:id_user` - Times de um usuário
- **Filtros disponíveis**:
  - `role_in_team`: Filtrar por cargo
  - `include_left`: Incluir usuários que saíram do time
- **Validações**:
  - Usuário só pode visualizar times aos quais pertence (exceto admins)

### 3. UPDATE - Atualizar Relacionamento

- **Endpoints**:
  - `PUT /user-teams/:id` - Atualizar por ID do relacionamento
  - `PUT /user-teams/user/:id_user_to_update/team/:id_team` - Atualizar por usuário e time
- **Campos atualizáveis**:
  - `role_in_team`: Cargo no time
- **Validações**:
  - Usuário requisitante deve ter permissão para gerenciar o time
  - Manager não pode alterar próprio cargo
  - Usuário comum só pode alterar próprios dados (limitado)

### 4. DELETE - Remover do Time

- **Endpoints**:
  - `DELETE /user-teams/:id` - Remover por ID do relacionamento
  - `DELETE /user-teams/user/:id_user_to_remove/team/:id_team` - Remover por usuário e time
  - `POST /user-teams/leave/:id_team` - Sair de um time (self-remove)
- **Opções**:
  - `force_delete=true`: Remoção física (hard delete)
  - `force_delete=false`: Soft delete (marca `left_at`)
- **Validações**:
  - Manager não pode remover outro manager
  - Usuário pode sempre sair de um time

## Permissões e Roles

### Roles Disponíveis

- `owner`: Dono da empresa (acesso total)
- `admin`: Administrador da empresa (acesso total)
- `manager`: Manager do time (pode gerenciar membros do seu time)
- `member`: Membro do time (acesso limitado)

### Matriz de Permissões

| Ação                      | Owner | Admin | Manager       | Member        |
| ------------------------- | ----- | ----- | ------------- | ------------- |
| Adicionar usuário ao time | ✅    | ✅    | ✅ (seu time) | ❌            |
| Ver usuários do time      | ✅    | ✅    | ✅ (seu time) | ✅ (seu time) |
| Alterar cargo de usuário  | ✅    | ✅    | ✅ (seu time) | ❌            |
| Remover usuário do time   | ✅    | ✅    | ✅ (seu time) | ❌            |
| Sair do time              | ✅    | ✅    | ✅            | ✅            |

## Estrutura do Banco de Dados

### Tabela `user_teams`

```sql
id              BIGINT PRIMARY KEY AUTO_INCREMENT
id_user         BIGINT NOT NULL (FK para users.id)
id_team         BIGINT NOT NULL (FK para teams.id)
role_in_team    VARCHAR(50) DEFAULT 'member'
joined_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
left_at         TIMESTAMP NULL (soft delete)
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

UNIQUE KEY unique_user_team_active (id_user, id_team, left_at)
INDEX idx_user_teams_user (id_user)
INDEX idx_user_teams_team (id_team)
INDEX idx_user_teams_active (left_at)
```

## Próximos Passos

1. **Implementar validações de schema**:

   - Aplicar schemas Zod nas rotas
   - Adicionar validações específicas por endpoint

2. **Adicionar testes**:

   - Testes unitários para usecases
   - Testes de integração para controllers
   - Testes de repository

3. **Integrar com rotas principais**:

   - Adicionar rotas ao router principal da aplicação
   - Configurar middlewares de autenticação

4. **Melhorias de performance**:

   - Implementar cache para consultas frequentes
   - Otimizar queries com joins

5. **Auditoria e logs**:
   - Implementar logs detalhados de alterações
   - Adicionar rastreamento de mudanças

## Uso Básico

```typescript
// Adicionar usuário ao time
POST /api/user-teams
{
  "id_user_to_add": 123,
  "id_team": 456,
  "role_in_team": "member"
}

// Buscar usuários de um time
GET /api/user-teams/team/456?include_left=false

// Atualizar cargo do usuário
PUT /api/user-teams/user/123/team/456
{
  "role_in_team": "manager"
}

// Sair de um time
POST /api/user-teams/leave/456
```

Este módulo segue a Clean Architecture e implementa todas as boas práticas do projeto, incluindo validação de permissões, logging estruturado e tratamento de erros adequado.
