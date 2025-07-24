# Documentação das APIs do Backoffice - Track OKR

## Visão Geral

Este documento descreve todas as rotas disponíveis no backoffice para gerenciamento de planos de assinatura e pagamentos da Efí Pay.

**Base URL:** `http://localhost:3000/backoffice`

## Autenticação

Todas as rotas do backoffice requerem autenticação via Bearer Token no header:

```
Authorization: Bearer {token}
```

**Tokens válidos para desenvolvimento:**

- `backoffice_dev_token_2025`
- `admin_master_key_dev`

---

## 📋 Planos de Assinatura

### 1. Listar Planos

**Endpoint:** `GET /backoffice/subscription-plans`

**Query Parameters:**

- `active` (opcional): `true` | `false` - Filtrar apenas planos ativos (padrão: `true`)

**Resposta de Sucesso:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Starter",
      "description": "Plano básico para pequenas equipes",
      "max_users": 5,
      "price_monthly": 29.9,
      "price_yearly": 299.0,
      "features": {
        "dashboard": true,
        "reports": "basic",
        "integrations": false,
        "support": "email"
      },
      "efi_plan_id": "plan_abc123",
      "is_active": true,
      "created_at": "2025-07-23T20:30:00.000Z",
      "updated_at": "2025-07-23T20:30:00.000Z"
    }
  ],
  "count": 1
}
```

### 2. Buscar Plano por ID

**Endpoint:** `GET /backoffice/subscription-plans/{id}`

**Resposta de Sucesso:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Starter",
    "description": "Plano básico para pequenas equipes",
    "max_users": 5,
    "price_monthly": 29.9,
    "price_yearly": 299.0,
    "features": {
      "dashboard": true,
      "reports": "basic"
    },
    "efi_plan_id": "plan_abc123",
    "is_active": true,
    "created_at": "2025-07-23T20:30:00.000Z",
    "updated_at": "2025-07-23T20:30:00.000Z"
  }
}
```

**Resposta de Erro (404):**

```json
{
  "success": false,
  "message": "Plano não encontrado"
}
```

### 3. Criar Novo Plano

**Endpoint:** `POST /backoffice/subscription-plans`

**Body (JSON):**

```json
{
  "name": "Professional",
  "description": "Plano completo para equipes em crescimento",
  "max_users": 25,
  "price_monthly": 79.9,
  "price_yearly": 799.0,
  "features": {
    "dashboard": true,
    "reports": "advanced",
    "integrations": true,
    "support": "priority"
  },
  "create_efi_plan": true
}
```

**Campos Obrigatórios:**

- `name` (string)
- `max_users` (number)
- `price_monthly` (number)

**Campos Opcionais:**

- `description` (string)
- `price_yearly` (number)
- `features` (object)
- `create_efi_plan` (boolean) - Se true, cria o plano também na Efí Pay

**Resposta de Sucesso (201):**

```json
{
  "success": true,
  "message": "Plano criado com sucesso",
  "data": {
    "id": 4,
    "name": "Professional",
    "description": "Plano completo para equipes em crescimento",
    "max_users": 25,
    "price_monthly": 79.9,
    "price_yearly": 799.0,
    "features": {
      "dashboard": true,
      "reports": "advanced"
    },
    "efi_plan_id": "plan_efi_xyz456",
    "is_active": true,
    "created_at": "2025-07-23T20:35:00.000Z",
    "updated_at": "2025-07-23T20:35:00.000Z"
  }
}
```

### 4. Atualizar Plano

**Endpoint:** `PUT /backoffice/subscription-plans/{id}`

**Body (JSON):**

```json
{
  "name": "Professional Plus",
  "max_users": 30,
  "price_monthly": 89.9
}
```

**Resposta de Sucesso:**

```json
{
  "success": true,
  "message": "Plano atualizado com sucesso",
  "data": {
    // dados do plano atualizado
  }
}
```

### 5. Desativar Plano

**Endpoint:** `DELETE /backoffice/subscription-plans/{id}`

**Resposta de Sucesso:**

```json
{
  "success": true,
  "message": "Plano desativado com sucesso"
}
```

### 6. Sincronizar com Efí Pay

**Endpoint:** `POST /backoffice/subscription-plans/sync-efi`

**Resposta de Sucesso:**

```json
{
  "success": true,
  "message": "Sincronização concluída",
  "data": {
    "efi_plans": [
      // planos da Efí Pay
    ],
    "local_plans": [
      // planos locais
    ],
    "synchronized_at": "2025-07-23T20:40:00.000Z"
  }
}
```

### 7. Criar Plano na Efí Pay

**Endpoint:** `POST /backoffice/subscription-plans/{id}/create-efi-plan`

**Resposta de Sucesso:**

```json
{
  "success": true,
  "message": "Plano criado na Efí Pay",
  "data": {
    "local_plan": {
      // dados do plano local atualizado
    },
    "efi_response": {
      // resposta da API da Efí Pay
    }
  }
}
```

### 8. Testar Conexão com Efí Pay

**Endpoint:** `GET /backoffice/subscription-plans/test-efi-connection`

**Resposta de Sucesso:**

```json
{
  "success": true,
  "message": "Conexão com Efí Pay funcionando",
  "data": {
    "connection_status": "ok",
    "timestamp": "2025-07-23T20:45:00.000Z",
    "sample_response": {
      // dados de exemplo da API
    }
  }
}
```

---

## 💳 Pagamentos

### 1. Listar Pagamentos

**Endpoint:** `GET /backoffice/payments`

**Query Parameters:**

- `company_id` (opcional): ID da empresa
- `subscription_id` (opcional): ID da assinatura
- `status` (opcional): `pending` | `paid` | `cancelled` | `failed` | `refunded` | `overdue`

**Resposta de Sucesso:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "subscription_id": 123,
      "company_id": 456,
      "efi_charge_id": "charge_abc123",
      "txid": "txid_xyz789",
      "amount": 79.9,
      "status": "pending",
      "payment_method": "credit_card",
      "due_date": "2025-08-01T00:00:00.000Z",
      "paid_at": null,
      "description": "Mensalidade Professional - Julho 2025",
      "webhook_data": null,
      "created_at": "2025-07-23T20:30:00.000Z",
      "updated_at": "2025-07-23T20:30:00.000Z"
    }
  ],
  "count": 1
}
```

### 2. Listar Pagamentos Pendentes

**Endpoint:** `GET /backoffice/payments/pending`

**Resposta:** Mesmo formato da listagem geral, apenas com status `pending`

### 3. Listar Pagamentos em Atraso

**Endpoint:** `GET /backoffice/payments/overdue`

**Resposta:** Mesmo formato da listagem geral, apenas com status `pending` e data de vencimento ultrapassada

### 4. Buscar Pagamento por ID

**Endpoint:** `GET /backoffice/payments/{id}`

**Resposta de Sucesso:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "subscription_id": 123,
    "company_id": 456,
    "efi_charge_id": "charge_abc123",
    "amount": 79.9,
    "status": "pending"
    // ... outros campos
  }
}
```

### 5. Sincronizar Pagamento com Efí Pay

**Endpoint:** `POST /backoffice/payments/{id}/sync-efi`

**Resposta de Sucesso:**

```json
{
  "success": true,
  "message": "Pagamento sincronizado com sucesso",
  "data": {
    "payment": {
      // dados do pagamento atualizado
    },
    "efi_data": {
      // dados retornados da Efí Pay
    }
  }
}
```

### 6. Sincronizar Todos os Pagamentos Pendentes

**Endpoint:** `POST /backoffice/payments/sync-all-pending`

**Resposta de Sucesso:**

```json
{
  "success": true,
  "message": "Sincronização em lote concluída",
  "data": {
    "total_processed": 15,
    "successful": 12,
    "failed": 3,
    "details": [
      {
        "payment_id": 1,
        "old_status": "pending",
        "new_status": "paid",
        "success": true
      },
      {
        "payment_id": 2,
        "success": false,
        "error": "Charge não encontrada na Efí Pay"
      }
    ]
  }
}
```

### 7. Estatísticas de Pagamentos

**Endpoint:** `GET /backoffice/payments/stats`

**Resposta de Sucesso:**

```json
{
  "success": true,
  "data": {
    "pending_count": 25,
    "overdue_count": 5,
    "pending_amount": 1997.5,
    "overdue_amount": 399.5,
    "last_updated": "2025-07-23T20:50:00.000Z"
  }
}
```

---

## 🔗 Webhook da Efí Pay

### Webhook de Notificações

**Endpoint:** `POST /webhook/efi-pay`

**Headers:**

- `x-efi-signature`: Assinatura do webhook da Efí Pay

**Eventos Processados:**

- `cobranca_paga`: Pagamento foi confirmado
- `cobranca_vencida`: Pagamento venceu
- `cobranca_cancelada`: Pagamento foi cancelado
- `assinatura_cancelada`: Assinatura foi cancelada
- `assinatura_suspensa`: Assinatura foi suspensa

**Resposta de Sucesso:**

```json
{
  "status": "processed"
}
```

---

## 🛡️ Middlewares de Segurança

### Autenticação

- Todas as rotas verificam o token Bearer
- Logs de auditoria são gerados automaticamente

### Rate Limiting

- Aplicado automaticamente nas rotas de webhook

### Logs de Auditoria

Todos os acessos ao backoffice são logados com:

- Usuário autenticado
- IP de origem
- Ação realizada
- Timestamp
- Duração da requisição

---

## 🚨 Códigos de Erro Comuns

### 400 - Bad Request

```json
{
  "success": false,
  "message": "Campos obrigatórios: name, price_monthly, max_users"
}
```

### 401 - Unauthorized

```json
{
  "success": false,
  "message": "Token de autorização necessário"
}
```

### 403 - Forbidden

```json
{
  "success": false,
  "message": "Token inválido"
}
```

### 404 - Not Found

```json
{
  "success": false,
  "message": "Plano não encontrado"
}
```

### 500 - Internal Server Error

```json
{
  "success": false,
  "message": "Erro interno do servidor",
  "error": "Detalhes do erro"
}
```

---

## 🔧 Configuração de Ambiente

Para usar as funcionalidades da Efí Pay, configure as seguintes variáveis:

```env
# Credenciais da Efí Pay
EFI_CLIENT_ID=your_efi_client_id_here
EFI_CLIENT_SECRET=your_efi_client_secret_here
EFI_SANDBOX=true
EFI_WEBHOOK_URL=https://your-domain.com/webhook/efi-pay
EFI_WEBHOOK_SECRET=your_webhook_secret_here

# Token de acesso para backoffice
BACKOFFICE_TOKEN=backoffice_dev_token_2025
```

---

## 🎯 Exemplos de Uso no Frontend

### React/JavaScript Example

```javascript
// Configuração base
const API_BASE = 'http://localhost:3000/backoffice';
const TOKEN = 'backoffice_dev_token_2025';

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

// Listar planos ativos
async function getActivePlans() {
  const response = await fetch(`${API_BASE}/subscription-plans?active=true`, {
    headers
  });
  return response.json();
}

// Criar novo plano
async function createPlan(planData) {
  const response = await fetch(`${API_BASE}/subscription-plans`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: planData.name,
      max_users: planData.maxUsers,
      price_monthly: planData.priceMonthly,
      create_efi_plan: true
    })
  });
  return response.json();
}

// Sincronizar pagamentos pendentes
async function syncPendingPayments() {
  const response = await fetch(`${API_BASE}/payments/sync-all-pending`, {
    method: 'POST',
    headers
  });
  return response.json();
}

// Obter estatísticas
async function getPaymentStats() {
  const response = await fetch(`${API_BASE}/payments/stats`, {
    headers
  });
  return response.json();
}
```

### cURL Examples

```bash
# Listar planos
curl -X GET "http://localhost:3000/backoffice/subscription-plans" \
  -H "Authorization: Bearer backoffice_dev_token_2025"

# Criar plano
curl -X POST "http://localhost:3000/backoffice/subscription-plans" \
  -H "Authorization: Bearer backoffice_dev_token_2025" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Enterprise",
    "max_users": 100,
    "price_monthly": 199.90,
    "create_efi_plan": true
  }'

# Testar conexão Efí Pay
curl -X GET "http://localhost:3000/backoffice/subscription-plans/test-efi-connection" \
  -H "Authorization: Bearer backoffice_dev_token_2025"
```

---

**Última atualização:** 23 de julho de 2025
**Versão da API:** 1.0.0
