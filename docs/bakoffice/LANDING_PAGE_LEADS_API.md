# Landing Page Leads API

Esta API é responsável por capturar e gerenciar leads vindos da landing page do Track OKR.

## Estrutura dos Controllers

A API foi organizada com responsabilidades separadas:

- **CreateLandingPageLeadController**: Responsável pela criação de novos leads
- **GetLandingPageLeadController**: Responsável pela busca e listagem de leads
- **UpdateLandingPageLeadController**: Responsável pela atualização do status dos leads

## Endpoints

### Criação de Leads

#### POST /landing-page/leads

Captura um novo lead da landing page.

**Endpoint:** `POST /landing-page/leads`  
**Rate Limit:** 30 requests por 5 minutos por IP  
**Autenticação:** Não requerida (endpoint público)  
**Controller:** `CreateLandingPageLeadController.createLead()`

#### Request Body

```json
{
  "name": "Marcos Barbosa",
  "email": "marcosvictorsb@gmail.com",
  "company": "Empresa Gennittta",
  "position": "Engenheiro de Software",
  "companySize": "51-200",
  "source": "landing-page",
  "page_url": "http://localhost:5173/",
  "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
  "timestamp": "2025-07-15T13:14:56.988Z",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "okr-software",
  "utm_term": "okr+tracking",
  "utm_content": "hero-button"
}
```

#### Campos

| Campo        | Tipo   | Obrigatório | Descrição                                               |
| ------------ | ------ | ----------- | ------------------------------------------------------- |
| name         | string | ✅          | Nome completo do lead                                   |
| email        | string | ✅          | Email válido do lead                                    |
| company      | string | ❌          | Nome da empresa                                         |
| position     | string | ❌          | Cargo/posição na empresa                                |
| companySize  | string | ❌          | Tamanho da empresa (1-10, 11-50, 51-200, 201-500, 500+) |
| source       | string | ❌          | Origem do lead (padrão: "landing-page")                 |
| page_url     | string | ❌          | URL onde o lead foi capturado                           |
| user_agent   | string | ❌          | User agent do navegador                                 |
| utm_source   | string | ❌          | Fonte da campanha UTM                                   |
| utm_medium   | string | ❌          | Meio da campanha UTM                                    |
| utm_campaign | string | ❌          | Nome da campanha UTM                                    |
| utm_term     | string | ❌          | Termo da campanha UTM                                   |
| utm_content  | string | ❌          | Conteúdo da campanha UTM                                |

#### Response Success (201)

```json
{
  "success": true,
  "message": "Lead registrado com sucesso",
  "data": {
    "id": 123,
    "email": "marcosvictorsb@gmail.com",
    "name": "Marcos Barbosa",
    "company": "Empresa Gennittta"
  }
}
```

#### Response - Lead já existe (200)

```json
{
  "success": true,
  "message": "Lead já registrado anteriormente",
  "data": {
    "id": 123,
    "email": "marcosvictorsb@gmail.com",
    "name": "Marcos Barbosa"
  }
}
```

#### Response Error (400)

```json
{
  "success": false,
  "message": "Nome e email são obrigatórios"
}
```

## Exemplos de Resposta dos Novos Endpoints

### GET /landing-page/leads-stats

```json
{
  "success": true,
  "data": {
    "total_leads": 150,
    "status_breakdown": {
      "new": 45,
      "contacted": 60,
      "qualified": 25,
      "converted": 15,
      "lost": 5
    },
    "recent_activity": {
      "last_30_days": 30,
      "today": 5
    },
    "conversion_rate": "10.00"
  }
}
```

### PUT /landing-page/leads/:id

**Request Body:**

```json
{
  "status": "contacted",
  "notes": "Enviado email de apresentação"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Lead atualizado com sucesso",
  "data": {
    "id": 123,
    "name": "Marcos Barbosa",
    "email": "marcosvictorsb@gmail.com",
    "status": "contacted",
    "notes": "Enviado email de apresentação",
    "contacted_at": "2025-07-15T14:30:00.000Z"
  }
}
```

### PATCH /landing-page/leads/:id/contacted

**Response:**

```json
{
  "success": true,
  "message": "Lead marcado como contatado",
  "data": {
    "id": 123,
    "status": "contacted",
    "contacted_at": "2025-07-15T14:30:00.000Z"
  }
}
```

### PATCH /landing-page/leads/:id/converted

**Response:**

```json
{
  "success": true,
  "message": "Lead marcado como convertido",
  "data": {
    "id": 123,
    "status": "converted",
    "contacted_at": "2025-07-15T14:30:00.000Z",
    "converted_at": "2025-07-15T15:45:00.000Z"
  }
}
```

### Busca e Listagem de Leads

#### GET /landing-page/leads

Lista leads capturados (endpoint protegido).

**Endpoint:** `GET /landing-page/leads`  
**Autenticação:** Será requerida (TODO: implementar middleware)  
**Controller:** `GetLandingPageLeadController.getLeads()`

#### GET /landing-page/leads/:id

Busca um lead específico por ID.

**Endpoint:** `GET /landing-page/leads/:id`  
**Autenticação:** Será requerida  
**Controller:** `GetLandingPageLeadController.getLeadById()`

#### GET /landing-page/leads/email/:email

Busca um lead específico por email.

**Endpoint:** `GET /landing-page/leads/email/:email`  
**Autenticação:** Será requerida  
**Controller:** `GetLandingPageLeadController.getLeadByEmail()`

#### GET /landing-page/leads-stats

Retorna estatísticas dos leads.

**Endpoint:** `GET /landing-page/leads-stats`  
**Autenticação:** Será requerida  
**Controller:** `GetLandingPageLeadController.getLeadsStats()`

### Atualização de Leads

#### PUT /landing-page/leads/:id

Atualiza status e notas de um lead.

**Endpoint:** `PUT /landing-page/leads/:id`  
**Autenticação:** Será requerida  
**Controller:** `UpdateLandingPageLeadController.updateLeadStatus()`

#### PATCH /landing-page/leads/:id/contacted

Marca um lead como contatado.

**Endpoint:** `PATCH /landing-page/leads/:id/contacted`  
**Autenticação:** Será requerida  
**Controller:** `UpdateLandingPageLeadController.markAsContacted()`

#### PATCH /landing-page/leads/:id/converted

Marca um lead como convertido.

**Endpoint:** `PATCH /landing-page/leads/:id/converted`  
**Autenticação:** Será requerida  
**Controller:** `UpdateLandingPageLeadController.markAsConverted()`

#### Query Parameters

| Parâmetro | Tipo   | Descrição                                                       |
| --------- | ------ | --------------------------------------------------------------- |
| status    | string | Filtrar por status (new, contacted, qualified, converted, lost) |
| company   | string | Filtrar por empresa                                             |
| source    | string | Filtrar por origem                                              |
| limit     | number | Limite de resultados (padrão: 50)                               |
| offset    | number | Offset para paginação (padrão: 0)                               |

#### Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "name": "Marcos Barbosa",
      "email": "marcosvictorsb@gmail.com",
      "company": "Empresa Gennittta",
      "position": "Engenheiro de Software",
      "company_size": "51-200",
      "status": "new",
      "source": "landing-page",
      "created_at": "2025-07-15T13:14:56.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 50,
    "offset": 0,
    "has_more": false
  }
}
```

### GET /landing-page/health

Health check do serviço.

**Endpoint:** `GET /landing-page/health`  
**Autenticação:** Não requerida

#### Response (200)

```json
{
  "status": "OK",
  "service": "Landing Page Leads API",
  "timestamp": "2025-07-15T13:14:56.988Z"
}
```

## Status dos Leads

Os leads podem ter os seguintes status:

- **new**: Lead recém capturado
- **contacted**: Lead foi contatado
- **qualified**: Lead foi qualificado
- **converted**: Lead foi convertido em cliente
- **lost**: Lead foi perdido

## Campos de Tracking

A API captura automaticamente:

- **IP Address**: Endereço IP do usuário
- **User Agent**: Informações do navegador
- **Page URL**: URL onde o lead foi capturado
- **UTM Parameters**: Parâmetros de campanha para tracking
- **Timestamp**: Data e hora da captura

## Rate Limiting

- **POST /landing-page/leads**: 30 requests por 5 minutos por IP
- Outros endpoints seguem o rate limiting global da API

## Banco de Dados

### Tabela: landing_page_leads

A tabela `landing_page_leads` armazena todos os dados dos leads com os seguintes campos principais:

- Informações pessoais: name, email, position
- Informações da empresa: company, company_size
- Dados de tracking: source, page_url, user_agent, ip_address
- UTM tracking: utm_source, utm_medium, utm_campaign, utm_term, utm_content
- Status e controle: status, notes, contacted_at, converted_at
- Timestamps: created_at, updated_at, deleted_at

### Índices

A tabela possui índices otimizados para:

- Busca por email
- Busca por empresa
- Filtro por status
- Filtro por origem
- Ordenação por data
- Tracking UTM
- Detecção de duplicatas (email + empresa)

## Exemplo de Uso

```javascript
// Capturar lead no frontend
const leadData = {
  name: document.getElementById('name').value,
  email: document.getElementById('email').value,
  company: document.getElementById('company').value,
  position: document.getElementById('position').value,
  companySize: document.getElementById('companySize').value,
  page_url: window.location.href,
  user_agent: navigator.userAgent,
  timestamp: new Date().toISOString(),
  // UTM parameters from URL
  utm_source: new URLSearchParams(window.location.search).get('utm_source'),
  utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
  utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign')
};

fetch('/landing-page/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(leadData)
})
  .then((response) => response.json())
  .then((data) => {
    if (data.success) {
      console.log('Lead capturado com sucesso!');
    }
  });
```

## TODO

- [ ] Implementar middleware de autenticação para GET /leads
- [ ] Adicionar endpoint para atualizar status dos leads
- [ ] Implementar webhooks para notificações
- [ ] Adicionar analytics e relatórios
- [ ] Integração com CRM
- [ ] Validação de domínio de email
- [ ] Detecção de bots/spam
- [ ] Export de dados (CSV, Excel)
