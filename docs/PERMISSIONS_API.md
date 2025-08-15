# API de Permissões da Empresa

## Visão Geral

A API de permissões permite que o frontend consulte os limites e uso atual de recursos da empresa baseado no plano de assinatura ativo. Isso permite que a interface do usuário mostre ou esconda funcionalidades dinamicamente conforme os limites do plano.

## Endpoint

```
GET /permissions/company/:id_company
```

### Parâmetros

- `id_company` (path parameter): ID da empresa para consultar as permissões

### Headers Obrigatórios

```
Authorization: Bearer <JWT_TOKEN>
```

### Response

#### Success (200)

```json
{
  "company": {
    "id": 123,
    "name": "Minha Empresa Ltda",
    "subscription": {
      "plan_name": "Pro",
      "status": "active",
      "trial_end_date": null
    }
  },
  "permissions": {
    "users": {
      "canCreate": true,
      "current": 25,
      "limit": 50,
      "remaining": 25
    },
    "planners": {
      "canCreate": false,
      "current": 10,
      "limit": 10,
      "remaining": 0
    },
    "teams": {
      "canCreate": true,
      "current": 3,
      "limit": 15,
      "remaining": 12
    },
    "objectives": {
      "canCreate": true,
      "current": 45,
      "limit": 100,
      "remaining": 55
    },
    "key_results": {
      "canCreate": true,
      "current": 180,
      "limit": 500,
      "remaining": 320
    }
  }
}
```

#### Error (400)

```json
{
  "message": "Usuário ou empresa inválidos"
}
```

#### Error (401)

```json
{
  "message": "Token inválido ou expirado"
}
```

#### Error (500)

```json
{
  "error": "Erro ao buscar permissões da empresa"
}
```

### Descrição dos Campos

#### Company Object

- `id`: ID único da empresa
- `name`: Nome da empresa
- `subscription.plan_name`: Nome do plano atual (Ex: "Gratuito", "Pro", "Enterprise")
- `subscription.status`: Status da assinatura ("active", "trial", "canceled", "expired")
- `subscription.trial_end_date`: Data de fim do trial (null se não estiver em trial)

#### Permission Object (para cada feature)

- `canCreate`: Boolean indicando se é possível criar novos recursos
- `current`: Quantidade atual de recursos utilizados
- `limit`: Limite máximo permitido pelo plano
- `remaining`: Quantidade restante disponível (limit - current)

#### Features Disponíveis

- `users`: Usuários da empresa
- `planners`: Planejamentos anuais
- `teams`: Times/equipes
- `objectives`: Objetivos por trimestre
- `key_results`: Resultados-chave por objetivo

---

## Como Usar no Frontend (track-okr-app)

### 1. Composable para Permissões

Crie um composable para gerenciar as permissões:

```typescript
// composables/useCompanyPermissions.ts
import { ref, computed, onMounted } from 'vue';
import { useApi } from './useApi';

interface FeaturePermission {
  canCreate: boolean;
  current: number;
  limit: number;
  remaining: number;
}

interface CompanyPermissions {
  company: {
    id: number;
    name: string;
    subscription: {
      plan_name: string;
      status: string;
      trial_end_date: string | null;
    };
  };
  permissions: {
    users: FeaturePermission;
    planners: FeaturePermission;
    teams: FeaturePermission;
    objectives: FeaturePermission;
    key_results: FeaturePermission;
  };
}

export const useCompanyPermissions = (companyId: number) => {
  const { $api } = useApi();

  const permissions = ref<CompanyPermissions | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const fetchPermissions = async () => {
    try {
      loading.value = true;
      error.value = null;

      const response = await $api.get(`/permissions/company/${companyId}`);
      permissions.value = response.data;
    } catch (err) {
      error.value = 'Erro ao carregar permissões';
      console.error('Erro ao buscar permissões:', err);
    } finally {
      loading.value = false;
    }
  };

  const canCreate = computed(() => {
    return (feature: keyof CompanyPermissions['permissions']) => {
      return permissions.value?.permissions[feature]?.canCreate ?? false;
    };
  });

  const getFeatureData = computed(() => {
    return (feature: keyof CompanyPermissions['permissions']) => {
      return permissions.value?.permissions[feature] ?? null;
    };
  });

  onMounted(() => {
    if (companyId) {
      fetchPermissions();
    }
  });

  return {
    permissions: readonly(permissions),
    loading: readonly(loading),
    error: readonly(error),
    canCreate,
    getFeatureData,
    refetch: fetchPermissions
  };
};
```

### 2. Componente de Verificação de Permissões

```vue
<!-- components/PermissionGuard.vue -->
<template>
  <div v-if="loading" class="flex justify-center items-center">
    <ProgressSpinner size="small" />
  </div>

  <div v-else-if="error" class="text-red-500">
    {{ error }}
  </div>

  <div v-else-if="canCreate">
    <slot />
  </div>

  <div v-else-if="$slots.fallback">
    <slot name="fallback" :featureData="featureData" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ProgressSpinner from 'primevue/progressspinner';
import { useCompanyPermissions } from '~/composables/useCompanyPermissions';

interface Props {
  companyId: number;
  feature: 'users' | 'planners' | 'teams' | 'objectives' | 'key_results';
}

const props = defineProps<Props>();

const {
  permissions,
  loading,
  error,
  canCreate: canCreateFn,
  getFeatureData
} = useCompanyPermissions(props.companyId);

const canCreate = computed(() => canCreateFn.value(props.feature));
const featureData = computed(() => getFeatureData.value(props.feature));
</script>
```

### 3. Componente de Progresso dos Limites

```vue
<!-- components/LimitProgress.vue -->
<template>
  <div v-if="loading" class="flex justify-center">
    <ProgressSpinner size="small" />
  </div>

  <div v-else-if="featureData" class="space-y-3">
    <div class="flex justify-between items-center">
      <span class="font-medium text-gray-700">{{ title }}</span>
      <span class="text-sm text-gray-500">
        {{ featureData.current }}/{{ featureData.limit }}
      </span>
    </div>

    <ProgressBar
      :value="percentage"
      :class="progressBarClass"
      :showValue="false"
    />

    <Message v-if="!featureData.canCreate" severity="warn" class="mt-2">
      Limite atingido! Considere fazer upgrade do plano.
    </Message>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ProgressSpinner from 'primevue/progressspinner';
import ProgressBar from 'primevue/progressbar';
import Message from 'primevue/message';
import { useCompanyPermissions } from '~/composables/useCompanyPermissions';

interface Props {
  companyId: number;
  feature: 'users' | 'planners' | 'teams' | 'objectives' | 'key_results';
  title: string;
}

const props = defineProps<Props>();

const { loading, getFeatureData } = useCompanyPermissions(props.companyId);

const featureData = computed(() => getFeatureData.value(props.feature));

const percentage = computed(() => {
  if (!featureData.value) return 0;
  return Math.round(
    (featureData.value.current / featureData.value.limit) * 100
  );
});

const progressBarClass = computed(() => {
  const value = percentage.value;
  if (value >= 90) return 'text-red-500';
  if (value >= 75) return 'text-orange-500';
  return 'text-green-500';
});
</script>
```

### 4. Uso em Páginas/Componentes

```vue
<!-- pages/users/index.vue -->
<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Usuários da Empresa</h1>

      <PermissionGuard :company-id="user.id_company" feature="users">
        <Button
          label="+ Novo Usuário"
          icon="pi pi-plus"
          @click="openCreateModal"
          class="bg-blue-600 hover:bg-blue-700"
        />

        <template #fallback="{ featureData }">
          <Button
            label="Limite Atingido - Faça Upgrade"
            icon="pi pi-lock"
            disabled
            severity="secondary"
          />
        </template>
      </PermissionGuard>
    </div>

    <!-- Progresso do limite -->
    <div class="mb-6">
      <LimitProgress
        :company-id="user.id_company"
        feature="users"
        title="Usuários"
      />
    </div>

    <!-- Lista de usuários -->
    <UsersList />
  </div>
</template>

<script setup>
import Button from 'primevue/button';
import { useAuthStore } from '~/stores/auth';
import PermissionGuard from '~/components/PermissionGuard.vue';
import LimitProgress from '~/components/LimitProgress.vue';
import UsersList from '~/components/UsersList.vue';

const authStore = useAuthStore();
const user = computed(() => authStore.user);

const openCreateModal = () => {
  // Lógica para abrir modal de criação
};
</script>
```

### 5. Store Pinia para Permissões Globais

```typescript
// stores/permissions.ts
import { defineStore } from 'pinia';
import { useApi } from '~/composables/useApi';

interface FeaturePermission {
  canCreate: boolean;
  current: number;
  limit: number;
  remaining: number;
}

interface CompanyPermissions {
  company: {
    id: number;
    name: string;
    subscription: {
      plan_name: string;
      status: string;
      trial_end_date: string | null;
    };
  };
  permissions: {
    users: FeaturePermission;
    planners: FeaturePermission;
    teams: FeaturePermission;
    objectives: FeaturePermission;
    key_results: FeaturePermission;
  };
}

export const usePermissionsStore = defineStore('permissions', () => {
  const { $api } = useApi();

  const permissions = ref<CompanyPermissions | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastFetch = ref<Date | null>(null);

  const fetchPermissions = async (companyId: number, force = false) => {
    // Cache por 5 minutos
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (!force && lastFetch.value && lastFetch.value > fiveMinutesAgo) {
      return;
    }

    try {
      loading.value = true;
      error.value = null;

      const response = await $api.get(`/permissions/company/${companyId}`);
      permissions.value = response.data;
      lastFetch.value = new Date();
    } catch (err) {
      error.value = 'Erro ao carregar permissões';
      console.error('Erro ao buscar permissões:', err);
    } finally {
      loading.value = false;
    }
  };

  const canCreate = computed(() => {
    return (feature: keyof CompanyPermissions['permissions']) => {
      return permissions.value?.permissions[feature]?.canCreate ?? false;
    };
  });

  const getFeatureData = computed(() => {
    return (feature: keyof CompanyPermissions['permissions']) => {
      return permissions.value?.permissions[feature] ?? null;
    };
  });

  const refreshPermissions = async (companyId: number) => {
    await fetchPermissions(companyId, true);
  };

  return {
    permissions: readonly(permissions),
    loading: readonly(loading),
    error: readonly(error),
    canCreate,
    getFeatureData,
    fetchPermissions,
    refreshPermissions
  };
});
```

### 6. Plugin para Auto-fetch de Permissões

```typescript
// plugins/permissions.client.ts
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  const permissionsStore = usePermissionsStore();

  // Auto-fetch permissões quando usuário estiver logado
  watch(
    () => authStore.user,
    async (user) => {
      if (user && user.id_company) {
        await permissionsStore.fetchPermissions(user.id_company);
      }
    },
    { immediate: true }
  );
});
```

### 7. Exemplo de Navegação Condicional

```vue
<!-- components/AppNavigation.vue -->
<template>
  <nav class="bg-white shadow-lg">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center py-4">
        <NuxtLink to="/dashboard" class="text-xl font-bold">
          TrackOKR
        </NuxtLink>

        <div class="flex space-x-4">
          <NuxtLink
            to="/dashboard"
            class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md"
          >
            Dashboard
          </NuxtLink>

          <template v-if="permissionsStore.canCreate('users')">
            <NuxtLink
              to="/users"
              class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md flex items-center gap-2"
            >
              <i class="pi pi-users"></i>
              Usuários
              <Badge
                :value="`${usersData?.current}/${usersData?.limit}`"
                severity="info"
                class="ml-1"
              />
            </NuxtLink>
          </template>

          <template v-if="permissionsStore.canCreate('planners')">
            <NuxtLink
              to="/planners"
              class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md"
            >
              <i class="pi pi-calendar"></i>
              Planejamentos
            </NuxtLink>
          </template>

          <template v-if="permissionsStore.canCreate('teams')">
            <NuxtLink
              to="/teams"
              class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md"
            >
              <i class="pi pi-sitemap"></i>
              Times
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import Badge from 'primevue/badge';
import { usePermissionsStore } from '~/stores/permissions';

const permissionsStore = usePermissionsStore();

const usersData = computed(() => permissionsStore.getFeatureData('users'));
</script>
```

### 8. Composable para API

```typescript
// composables/useApi.ts
export const useApi = () => {
  const config = useRuntimeConfig();
  const { $toast } = useNuxtApp();

  const $api = $fetch.create({
    baseURL: config.public.apiBase || 'http://localhost:3000',

    onRequest({ request, options }) {
      // Adicionar token automaticamente
      const token = useCookie('auth_token');
      if (token.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token.value}`
        };
      }
    },

    onResponseError({ response }) {
      if (response.status === 401) {
        // Token expirado - redirecionar para login
        navigateTo('/login');
      } else if (response.status >= 500) {
        $toast.add({
          severity: 'error',
          summary: 'Erro do servidor',
          detail: 'Tente novamente mais tarde',
          life: 5000
        });
      }
    }
  });

  return { $api };
};
```

### 9. Middleware para Verificação de Permissões

```typescript
// middleware/permissions.ts
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  const permissionsStore = usePermissionsStore();

  // Definir permissões necessárias por rota
  const routePermissions: Record<string, string> = {
    '/users': 'users',
    '/planners': 'planners',
    '/teams': 'teams',
    '/objectives': 'objectives'
  };

  const requiredFeature = routePermissions[to.path];

  if (requiredFeature && !permissionsStore.canCreate(requiredFeature)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Acesso negado - limite da funcionalidade atingido'
    });
  }
});
```

### 10. Toast/Notification para Limites

```vue
<!-- components/LimitToast.vue -->
<template>
  <Toast position="top-right" />
</template>

<script setup>
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { usePermissionsStore } from '~/stores/permissions';

const toast = useToast();
const permissionsStore = usePermissionsStore();

// Observar mudanças nas permissões para mostrar avisos
watch(
  () => permissionsStore.permissions,
  (newPermissions, oldPermissions) => {
    if (!newPermissions || !oldPermissions) return;

    // Verificar se algum limite foi atingido
    Object.entries(newPermissions.permissions).forEach(([feature, data]) => {
      const oldData = oldPermissions.permissions[feature];

      if (data.current >= data.limit && oldData.current < oldData.limit) {
        toast.add({
          severity: 'warn',
          summary: 'Limite Atingido',
          detail: `Você atingiu o limite de ${feature}. Considere fazer upgrade do seu plano.`,
          life: 8000
        });
      }
    });
  },
  { deep: true }
);
</script>
```

---

## Casos de Uso Recomendados

1. **Verificação antes de mostrar botões de criação**
2. **Mostrar progresso visual dos limites**
3. **Navegação condicional baseada em permissões**
4. **Mensagens de upgrade quando limite atingido**
5. **Cache das permissões para evitar chamadas desnecessárias**
6. **Refetch após operações que alteram contadores**

## Considerações de Performance

- **Cache**: Use cache de 5-10 minutos para evitar chamadas excessivas
- **Refetch**: Atualize após criar/deletar recursos que afetam os contadores
- **Loading States**: Sempre mostre estados de carregamento apropriados
- **Error Handling**: Trate erros graciosamente com fallbacks
