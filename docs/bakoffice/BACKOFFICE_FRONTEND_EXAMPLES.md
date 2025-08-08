# Exemplos de Componentes React - Backoffice Track OKR

Este documento contém exemplos práticos de como implementar componentes React para consumir as APIs do backoffice.

## 🔧 Configuração Base

### API Client Service

```javascript
// services/backofficeApi.js
class BackofficeAPI {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    this.token =
      localStorage.getItem('backoffice_token') || 'backoffice_dev_token_2025';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/backoffice${endpoint}`;
    const config = {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Planos
  getPlans(active = true) {
    return this.request(`/subscription-plans?active=${active}`);
  }

  getPlan(id) {
    return this.request(`/subscription-plans/${id}`);
  }

  createPlan(planData) {
    return this.request('/subscription-plans', {
      method: 'POST',
      body: JSON.stringify(planData)
    });
  }

  updatePlan(id, planData) {
    return this.request(`/subscription-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(planData)
    });
  }

  deletePlan(id) {
    return this.request(`/subscription-plans/${id}`, {
      method: 'DELETE'
    });
  }

  syncWithEfi() {
    return this.request('/subscription-plans/sync-efi', {
      method: 'POST'
    });
  }

  testEfiConnection() {
    return this.request('/subscription-plans/test-efi-connection');
  }

  // Pagamentos
  getPayments(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/payments?${params}`);
  }

  getPendingPayments() {
    return this.request('/payments/pending');
  }

  getOverduePayments() {
    return this.request('/payments/overdue');
  }

  getPaymentStats() {
    return this.request('/payments/stats');
  }

  syncPayment(id) {
    return this.request(`/payments/${id}/sync-efi`, {
      method: 'POST'
    });
  }

  syncAllPendingPayments() {
    return this.request('/payments/sync-all-pending', {
      method: 'POST'
    });
  }
}

export const backofficeAPI = new BackofficeAPI();
```

## 📋 Componentes para Gestão de Planos

### Lista de Planos

```jsx
// components/PlansManager.jsx
import React, { useState, useEffect } from 'react';
import { backofficeAPI } from '../services/backofficeApi';

export default function PlansManager() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    loadPlans();
  }, [showInactive]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await backofficeAPI.getPlans(!showInactive);
      setPlans(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Tem certeza que deseja desativar este plano?')) return;

    try {
      await backofficeAPI.deletePlan(id);
      loadPlans(); // Recarregar lista
    } catch (err) {
      alert('Erro ao desativar plano: ' + err.message);
    }
  };

  const handleSyncEfi = async () => {
    try {
      setLoading(true);
      const result = await backofficeAPI.syncWithEfi();
      alert('Sincronização concluída!');
      console.log(result);
    } catch (err) {
      alert('Erro na sincronização: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="error">Erro: {error}</div>;

  return (
    <div className="plans-manager">
      <div className="header">
        <h2>Gestão de Planos</h2>
        <div className="actions">
          <label>
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Mostrar inativos
          </label>
          <button onClick={handleSyncEfi} className="btn-sync">
            Sincronizar com Efí Pay
          </button>
          <button className="btn-primary">Novo Plano</button>
        </div>
      </div>

      <div className="plans-grid">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${!plan.is_active ? 'inactive' : ''}`}
          >
            <div className="plan-header">
              <h3>{plan.name}</h3>
              <span
                className={`status ${plan.is_active ? 'active' : 'inactive'}`}
              >
                {plan.is_active ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            <p className="description">{plan.description}</p>

            <div className="plan-details">
              <div className="detail">
                <strong>Usuários:</strong> {plan.max_users}
              </div>
              <div className="detail">
                <strong>Preço Mensal:</strong> R$ {plan.price_monthly}
              </div>
              {plan.price_yearly && (
                <div className="detail">
                  <strong>Preço Anual:</strong> R$ {plan.price_yearly}
                </div>
              )}
              {plan.efi_plan_id && (
                <div className="detail">
                  <strong>ID Efí:</strong> {plan.efi_plan_id}
                </div>
              )}
            </div>

            <div className="features">
              <h4>Funcionalidades:</h4>
              <ul>
                {Object.entries(plan.features).map(([key, value]) => (
                  <li key={key}>
                    {key}:{' '}
                    {typeof value === 'boolean' ? (value ? '✅' : '❌') : value}
                  </li>
                ))}
              </ul>
            </div>

            <div className="plan-actions">
              <button className="btn-edit">Editar</button>
              <button
                className="btn-delete"
                onClick={() => handleDeletePlan(plan.id)}
              >
                Desativar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Formulário de Criação/Edição de Plano

```jsx
// components/PlanForm.jsx
import React, { useState, useEffect } from 'react';
import { backofficeAPI } from '../services/backofficeApi';

export default function PlanForm({ planId, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    max_users: 5,
    price_monthly: 0,
    price_yearly: 0,
    create_efi_plan: true,
    features: {
      dashboard: true,
      reports: 'basic',
      integrations: false,
      support: 'email',
      custom_branding: false,
      api_access: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (planId) {
      loadPlan();
    }
  }, [planId]);

  const loadPlan = async () => {
    try {
      const response = await backofficeAPI.getPlan(planId);
      setFormData({
        ...response.data,
        create_efi_plan: false // Não recriar na Efí ao editar
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (planId) {
        await backofficeAPI.updatePlan(planId, formData);
      } else {
        await backofficeAPI.createPlan(formData);
      }
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureChange = (feature, value) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: value
      }
    }));
  };

  return (
    <div className="plan-form">
      <h3>{planId ? 'Editar Plano' : 'Novo Plano'}</h3>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nome do Plano *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Descrição</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Máximo de Usuários *</label>
            <input
              type="number"
              value={formData.max_users}
              onChange={(e) =>
                handleInputChange('max_users', parseInt(e.target.value))
              }
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Preço Mensal (R$) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.price_monthly}
              onChange={(e) =>
                handleInputChange('price_monthly', parseFloat(e.target.value))
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Preço Anual (R$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.price_yearly}
              onChange={(e) =>
                handleInputChange('price_yearly', parseFloat(e.target.value))
              }
            />
          </div>
        </div>

        <div className="form-group">
          <h4>Funcionalidades</h4>

          <label>
            <input
              type="checkbox"
              checked={formData.features.dashboard}
              onChange={(e) =>
                handleFeatureChange('dashboard', e.target.checked)
              }
            />
            Dashboard
          </label>

          <label>
            Relatórios:
            <select
              value={formData.features.reports}
              onChange={(e) => handleFeatureChange('reports', e.target.value)}
            >
              <option value="basic">Básico</option>
              <option value="advanced">Avançado</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </label>

          <label>
            <input
              type="checkbox"
              checked={formData.features.integrations}
              onChange={(e) =>
                handleFeatureChange('integrations', e.target.checked)
              }
            />
            Integrações
          </label>

          <label>
            Suporte:
            <select
              value={formData.features.support}
              onChange={(e) => handleFeatureChange('support', e.target.value)}
            >
              <option value="community">Comunidade</option>
              <option value="email">Email</option>
              <option value="priority">Prioritário</option>
              <option value="dedicated">Dedicado</option>
            </select>
          </label>
        </div>

        {!planId && (
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.create_efi_plan}
                onChange={(e) =>
                  handleInputChange('create_efi_plan', e.target.checked)
                }
              />
              Criar plano na Efí Pay automaticamente
            </label>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Salvando...' : planId ? 'Atualizar' : 'Criar'}
          </button>
        </div>
      </form>
    </div>
  );
}
```

## 💳 Componentes para Gestão de Pagamentos

### Dashboard de Pagamentos

```jsx
// components/PaymentsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { backofficeAPI } from '../services/backofficeApi';

export default function PaymentsDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [overduePayments, setOverduePayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes, overdueRes] = await Promise.all([
        backofficeAPI.getPaymentStats(),
        backofficeAPI.getPendingPayments(),
        backofficeAPI.getOverduePayments()
      ]);

      setStats(statsRes.data);
      setPendingPayments(pendingRes.data);
      setOverduePayments(overdueRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      const result = await backofficeAPI.syncAllPendingPayments();
      alert(
        `Sincronização concluída! ${result.data.successful} sucessos, ${result.data.failed} falhas`
      );
      loadData(); // Recarregar dados
    } catch (err) {
      alert('Erro na sincronização: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncPayment = async (paymentId) => {
    try {
      await backofficeAPI.syncPayment(paymentId);
      alert('Pagamento sincronizado!');
      loadData();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  if (loading) return <div className="loading">Carregando dashboard...</div>;

  return (
    <div className="payments-dashboard">
      <div className="dashboard-header">
        <h2>Dashboard de Pagamentos</h2>
        <button onClick={handleSyncAll} disabled={syncing} className="btn-sync">
          {syncing ? 'Sincronizando...' : 'Sincronizar Todos'}
        </button>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Pendentes</h3>
            <div className="stat-number">{stats.pending_count}</div>
            <div className="stat-value">
              R$ {stats.pending_amount.toFixed(2)}
            </div>
          </div>
          <div className="stat-card overdue">
            <h3>Em Atraso</h3>
            <div className="stat-number">{stats.overdue_count}</div>
            <div className="stat-value">
              R$ {stats.overdue_amount.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Pagamentos em Atraso */}
      {overduePayments.length > 0 && (
        <div className="payments-section">
          <h3 className="section-title">⚠️ Pagamentos em Atraso</h3>
          <div className="payments-table">
            {overduePayments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onSync={handleSyncPayment}
                variant="overdue"
              />
            ))}
          </div>
        </div>
      )}

      {/* Pagamentos Pendentes */}
      <div className="payments-section">
        <h3 className="section-title">📋 Pagamentos Pendentes</h3>
        <div className="payments-table">
          {pendingPayments.slice(0, 10).map((payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              onSync={handleSyncPayment}
            />
          ))}
        </div>
        {pendingPayments.length > 10 && (
          <div className="show-more">
            <button>
              Ver todos os {pendingPayments.length} pagamentos pendentes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente auxiliar para cada pagamento
function PaymentCard({ payment, onSync, variant = 'normal' }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    return `R$ ${parseFloat(value).toFixed(2)}`;
  };

  return (
    <div className={`payment-card ${variant}`}>
      <div className="payment-info">
        <div className="payment-id">#{payment.id}</div>
        <div className="payment-amount">{formatCurrency(payment.amount)}</div>
        <div className="payment-status">{payment.status}</div>
        {payment.due_date && (
          <div className="payment-due">
            Vence: {formatDate(payment.due_date)}
          </div>
        )}
        {payment.efi_charge_id && (
          <div className="efi-id">Efí: {payment.efi_charge_id}</div>
        )}
      </div>
      <div className="payment-actions">
        <button onClick={() => onSync(payment.id)} className="btn-sync-small">
          Sincronizar
        </button>
      </div>
    </div>
  );
}
```

## 🔧 Hook Personalizado para API

```jsx
// hooks/useBackofficeAPI.js
import { useState, useEffect, useCallback } from 'react';
import { backofficeAPI } from '../services/backofficeApi';

export function useBackofficeAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { apiCall, loading, error, setError };
}

// Exemplo de uso:
// const { apiCall, loading, error } = useBackofficeAPI();
// const plans = await apiCall(backofficeAPI.getPlans, true);
```

## 🎨 CSS Base para os Componentes

```css
/* styles/backoffice.css */
.plans-manager {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e1e5e9;
}

.actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.plan-card {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.plan-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.plan-card.inactive {
  opacity: 0.6;
  background: #f8f9fa;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.status.active {
  background: #28a745;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status.inactive {
  background: #6c757d;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.plan-details {
  margin: 15px 0;
}

.detail {
  margin: 5px 0;
  font-size: 14px;
}

.features ul {
  list-style: none;
  padding: 0;
  margin: 10px 0;
}

.features li {
  padding: 3px 0;
  font-size: 13px;
}

.plan-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e1e5e9;
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-edit {
  background: #28a745;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-delete {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-sync {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.error {
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 4px;
  margin: 10px 0;
}

/* Dashboard de Pagamentos */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card.overdue {
  border-left: 4px solid #dc3545;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.stat-value {
  font-size: 1.2rem;
  color: #666;
  margin-top: 5px;
}

.payment-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  margin-bottom: 10px;
  background: white;
}

.payment-card.overdue {
  border-left: 4px solid #dc3545;
  background: #fff5f5;
}

.payment-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.payment-info > div {
  font-size: 14px;
}

.payment-amount {
  font-weight: bold;
  color: #28a745;
}

.btn-sync-small {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}
```

---

**Última atualização:** 23 de julho de 2025
**Versão:** 1.0.0
