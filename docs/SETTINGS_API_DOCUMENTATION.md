# Settings API Documentation

Esta documentação descreve como consumir as APIs do domínio Settings para gerenciar configurações de empresas no sistema Track OKR.

## 📋 Visão Geral

O domínio Settings permite gerenciar configurações específicas de cada empresa, controlando permissões e comportamentos do sistema como:

- Bloqueio de criação/edição de OKRs
- Bloqueio de criação/edição de resultados-chave
- Configuração de trimestres permitidos
- Restrição ao trimestre atual

## 🔐 Autenticação

Todas as rotas requerem autenticação JWT. Inclua o token no header:

```
Authorization: Bearer <seu_jwt_token>
```

## 📊 Estrutura da Entidade Setting

```typescript
{
  id: number;
  block_okr_creation: boolean;
  block_key_result_creation: boolean;
  block_okr_editing: boolean;
  block_key_result_editing: boolean;
  allowed_quarters: number[];
  current_quarter_only: boolean;
  id_company: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🛠 Endpoints Disponíveis

### 1. Criar Configurações da Empresa

**POST** `/settings`

Cria novas configurações para uma empresa. Só é possível criar uma configuração por empresa.

#### Headers

```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

#### Body (JSON)

```json
{
  "block_okr_creation": false,
  "block_key_result_creation": false,
  "block_okr_editing": false,
  "block_key_result_editing": false,
  "allowed_quarters": [1, 2, 3, 4],
  "current_quarter_only": false,
  "id_company": 123
}
```

#### Campos Opcionais

Todos os campos são opcionais. Se não informados, assumem valores padrão:

- `block_okr_creation`: `false`
- `block_key_result_creation`: `false`
- `block_okr_editing`: `false`
- `block_key_result_editing`: `false`
- `allowed_quarters`: `[1, 2, 3, 4]`
- `current_quarter_only`: `false`

#### Respostas

**201 Created** - Configuração criada com sucesso

```json
{
  "id": 1,
  "block_okr_creation": false,
  "block_key_result_creation": false,
  "block_okr_editing": false,
  "block_key_result_editing": false,
  "allowed_quarters": [1, 2, 3, 4],
  "current_quarter_only": false,
  "id_company": 123,
  "createdAt": "2025-08-21T10:00:00.000Z",
  "updatedAt": "2025-08-21T10:00:00.000Z"
}
```

**400 Bad Request** - Erros de validação

```json
{
  "error": "Configuração já existe para esta empresa. Use o endpoint de atualização."
}
```

**400 Bad Request** - Usuário inválido

```json
{
  "error": "Usuário ou empresa inválidos"
}
```

**500 Internal Server Error** - Erro interno

```json
{
  "error": "Erro ao criar as configurações"
}
```

#### Exemplo de Uso

```javascript
const response = await fetch('/settings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  body: JSON.stringify({
    block_okr_creation: true,
    block_key_result_editing: true,
    allowed_quarters: [1, 2],
    current_quarter_only: true,
    id_company: 123
  })
});

const data = await response.json();
console.log(data);
```

---

### 2. Atualizar Configurações da Empresa

**PUT** `/settings/:id`

Atualiza configurações existentes de uma empresa.

#### Headers

```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

#### Parâmetros da URL

- `id`: ID da configuração a ser atualizada

#### Body (JSON)

```json
{
  "block_okr_creation": true,
  "block_key_result_creation": false,
  "block_okr_editing": true,
  "block_key_result_editing": false,
  "allowed_quarters": [1, 2, 3],
  "current_quarter_only": true,
  "id_company": 123
}
```

#### Campos Opcionais

Todos os campos são opcionais. Apenas os campos enviados serão atualizados.

#### Respostas

**200 OK** - Configuração atualizada com sucesso

```json
{
  "id": 1,
  "block_okr_creation": true,
  "block_key_result_creation": false,
  "block_okr_editing": true,
  "block_key_result_editing": false,
  "allowed_quarters": [1, 2, 3],
  "current_quarter_only": true,
  "id_company": 123,
  "createdAt": "2025-08-21T10:00:00.000Z",
  "updatedAt": "2025-08-21T11:30:00.000Z"
}
```

**400 Bad Request** - ID inválido

```json
{
  "error": "ID deve ser um número válido"
}
```

**400 Bad Request** - Usuário inválido

```json
{
  "error": "Usuário ou empresa inválidos"
}
```

**404 Not Found** - Configuração não encontrada

```json
{
  "error": "Configuração não encontrada"
}
```

**500 Internal Server Error** - Erro interno

```json
{
  "error": "Erro ao atualizar as configurações"
}
```

#### Exemplo de Uso

```javascript
const response = await fetch('/settings/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  body: JSON.stringify({
    block_okr_creation: false,
    allowed_quarters: [1, 2, 3, 4],
    current_quarter_only: false
  })
});

const data = await response.json();
console.log(data);
```

---

## 🔍 Validações

### Campos Obrigatórios

- `id_company`: Deve ser um número inteiro positivo

### Validações de Tipos

- `block_okr_creation`: boolean
- `block_key_result_creation`: boolean
- `block_okr_editing`: boolean
- `block_key_result_editing`: boolean
- `allowed_quarters`: array de números de 1 a 4
- `current_quarter_only`: boolean
- `id_company`: número inteiro positivo

### Regras de Negócio

1. **Criação**: Só é possível criar uma configuração por empresa
2. **Atualização**: Só é possível atualizar configurações existentes
3. **Autorização**: Usuário deve pertencer à empresa
4. **Trimestres**: `allowed_quarters` deve conter apenas valores de 1 a 4
5. **Empresa**: O `id_company` deve corresponder a uma empresa válida

## 🚨 Tratamento de Erros

### Códigos de Status HTTP

- `200`: Sucesso na atualização
- `201`: Sucesso na criação
- `400`: Erro de validação ou regra de negócio
- `401`: Não autorizado (token inválido)
- `404`: Recurso não encontrado
- `500`: Erro interno do servidor

### Estrutura de Erro Padrão

```json
{
  "error": "Mensagem descritiva do erro"
}
```

## 🔧 Exemplos de Cenários de Uso

### Cenário 1: Empresa Nova - Criar Configurações Padrão

```javascript
// Criar configurações com valores padrão para empresa nova
const response = await fetch('/settings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer token...'
  },
  body: JSON.stringify({
    id_company: 456
  })
});
```

### Cenário 2: Bloquear Criação de OKRs no Meio do Trimestre

```javascript
// Configurar para bloquear criação de OKRs e permitir apenas trimestre atual
const response = await fetch('/settings/2', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer token...'
  },
  body: JSON.stringify({
    block_okr_creation: true,
    current_quarter_only: true,
    id_company: 456
  })
});
```

### Cenário 3: Configurar Empresa para Trabalhar Apenas com Q1 e Q2

```javascript
// Restringir empresa para trabalhar apenas nos dois primeiros trimestres
const response = await fetch('/settings/3', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer token...'
  },
  body: JSON.stringify({
    allowed_quarters: [1, 2],
    id_company: 789
  })
});
```

## 🎯 Dicas de Implementação

1. **Cache**: Considere fazer cache das configurações no frontend para evitar requisições desnecessárias
2. **Validação Frontend**: Implemente as mesmas validações no frontend para melhor UX
3. **Estados de Loading**: Implemente estados de loading para as operações assíncronas
4. **Tratamento de Erro**: Sempre trate os diferentes códigos de erro HTTP apropriadamente
5. **Feedback Visual**: Forneça feedback visual claro quando configurações são alteradas

## 📝 Notas Importantes

- As configurações afetam o comportamento de toda a empresa
- Mudanças nas configurações podem impactar usuários ativos
- Sempre valide permissões do usuário antes de permitir alterações
- Considere implementar logs de auditoria para mudanças de configuração
- As configurações são persistidas e mantidas entre sessões
