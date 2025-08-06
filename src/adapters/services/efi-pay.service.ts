import 'dotenv/config';
import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

// Tipos de dados para a EFI Pay
export interface CreatePlanRequest {
  name: string;
  interval: number; // Máximo 24 (meses)
  repeats: number; // Mínimo 2
}

export interface EfiChargeData {
  items: Array<{
    name: string;
    amount: number; // quantidade
    value: number; // valor unitário em centavos
  }>;
  shippings?: Array<{
    name: string;
    value: number;
  }>;
  payment: {
    method: 'banking_billet' | 'credit_card' | 'pix';
    credit_card?: {
      installments: number;
      billing_address: {
        street: string;
        number: string;
        neighborhood: string;
        zipcode: string;
        city: string;
        state: string;
      };
      payment_token: string;
      customer: {
        name: string;
        email: string;
        cpf: string;
        birth: string;
        phone_number: string;
      };
    };
    banking_billet?: {
      expire_at: string;
      customer: {
        name: string;
        email: string;
        cpf: string;
        birth: string;
        phone_number: string;
      };
    };
  };
  metadata?: {
    custom_id?: string;
    notification_url?: string;
  };
}

export interface EfiSubscriptionData {
  plan_id: string;
  items: Array<{
    name: string;
    amount: number;
    value: number;
  }>;
  customer: {
    name: string;
    email: string;
    cpf: string;
    birth: string;
    phone_number: string;
  };
  payment_method: 'banking_billet' | 'credit_card';
  conditional_discount_date?: string;
  conditional_discount_value?: number;
  metadata?: {
    custom_id?: string;
    notification_url?: string;
  };
}

// Tipos de resposta da EFI Pay
export interface EfiAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface EfiPlanResponse {
  data: {
    plan_id: string;
    name: string;
    interval: number;
    repeats: number;
    value: number;
    status: string;
    created_at: string;
  };
}

export interface EfiChargeResponse {
  data: {
    charge_id: string;
    status: string;
    total: number;
    payment: {
      method: string;
      banking_billet?: {
        link: string;
        barcode: string;
        expire_at: string;
      };
      credit_card?: {
        installments: number;
        brand: string;
      };
      pix?: {
        qr_code: string;
        copy_paste: string;
      };
    };
    created_at: string;
    paid_at?: string;
    expires_at?: string;
  };
}

export interface EfiSubscriptionResponse {
  data: {
    subscription_id: string;
    plan_id: string;
    customer: object;
    status: string;
    created_at: string;
  };
}

export interface EfiListResponse<T> {
  data: T[];
  pagination?: {
    offset: number;
    limit: number;
    total: number;
  };
}

export class EfiPayService {
  private apiClient: AxiosInstance;
  private accessToken: string = '';
  private tokenExpiresAt: Date = new Date();

  constructor() {
    // URLs corretas da EFI Pay baseadas na documentação oficial
    const baseURL =
      process.env.EFI_SANDBOX === 'true'
        ? 'https://cobrancas-h.api.efipay.com.br'
        : 'https://cobrancas.api.efipay.com.br';

    this.apiClient = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'User-Agent': 'Track-OKR-API/1.0',
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Interceptor para debug
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log(`[EFI Pay] ${config.method?.toUpperCase()} ${config.url}`, {
          headers: config.headers,
          data: config.data
        });
        return config;
      },
      (error) => {
        console.error('[EFI Pay] Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.apiClient.interceptors.response.use(
      (response) => {
        console.log(`[EFI Pay] Response ${response.status}:`, response.data);
        return response;
      },
      (error) => {
        console.error('[EFI Pay] Response Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Autentica com a API da Efí Pay
   */
  private async authenticate(): Promise<void> {
    try {
      // Verificar se o token ainda é válido
      if (this.accessToken && this.tokenExpiresAt > new Date()) {
        return;
      }

      const clientId = process.env.EFI_CLIENT_ID;
      const clientSecret = process.env.EFI_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error(
          'Credenciais da Efí Pay não configuradas. Verifique EFI_CLIENT_ID e EFI_CLIENT_SECRET'
        );
      }

      console.log('[EFI Pay] Iniciando autenticação...');

      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
        'base64'
      );

      const response = await this.apiClient.post(
        '/v1/authorize',
        {
          grant_type: 'client_credentials'
        },
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Token expira em 1 hora, vamos renovar 5 minutos antes
      const expiresIn = response.data.expires_in || 3600;
      this.tokenExpiresAt = new Date(Date.now() + (expiresIn - 300) * 1000);

      // Configurar interceptor para adicionar o token em todas as requisições
      this.apiClient.defaults.headers.common['Authorization'] =
        `Bearer ${this.accessToken}`;

      console.log('[EFI Pay] Autenticação realizada com sucesso');
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: unknown; status?: number };
        message?: string;
      };
      console.error('[EFI Pay] Erro na autenticação:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message
      });
      throw new Error(
        `Falha na autenticação com a Efí Pay: ${axiosError.message}`
      );
    }
  }

  /**
   * Cria um plano de assinatura na Efí Pay
   */
  async createPlan(planData: CreatePlanRequest): Promise<EfiPlanResponse> {
    await this.authenticate();

    try {
      const response = await this.apiClient.post('/v1/plan', planData);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: unknown; status?: number };
        message?: string;
      };
      console.error('[EFI Pay] Erro ao criar plano:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message
      });
      throw new Error(`Falha ao criar plano na Efí Pay: ${axiosError.message}`);
    }
  }

  /**
   * Cria uma assinatura na Efí Pay
   */
  async createSubscription(
    subscriptionData: EfiSubscriptionData
  ): Promise<EfiSubscriptionResponse> {
    await this.authenticate();

    try {
      const response = await this.apiClient.post(
        '/v1/plan/subscription',
        subscriptionData
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: unknown; status?: number };
        message?: string;
      };
      console.error('[EFI Pay] Erro ao criar assinatura:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message
      });
      throw new Error(
        `Falha ao criar assinatura na Efí Pay: ${axiosError.message}`
      );
    }
  }

  /**
   * Cria uma cobrança única na Efí Pay
   */
  async createCharge(chargeData: EfiChargeData): Promise<EfiChargeResponse> {
    await this.authenticate();

    try {
      const response = await this.apiClient.post('/v1/charge', chargeData);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: unknown; status?: number };
        message?: string;
      };
      console.error('[EFI Pay] Erro ao criar cobrança:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message
      });
      throw new Error(
        `Falha ao criar cobrança na Efí Pay: ${axiosError.message}`
      );
    }
  }

  /**
   * Consulta o status de uma cobrança
   */
  async getCharge(chargeId: string): Promise<EfiChargeResponse> {
    await this.authenticate();

    try {
      const response = await this.apiClient.get(`/v1/charge/${chargeId}`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: unknown; status?: number };
        message?: string;
      };
      console.error('[EFI Pay] Erro ao consultar cobrança:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message
      });
      throw new Error(
        `Falha ao consultar cobrança na Efí Pay: ${axiosError.message}`
      );
    }
  }

  /**
   * Consulta o status de uma assinatura
   */
  async getSubscription(
    subscriptionId: string
  ): Promise<EfiSubscriptionResponse> {
    await this.authenticate();

    try {
      const response = await this.apiClient.get(
        `/v1/plan/subscription/${subscriptionId}`
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: unknown; status?: number };
        message?: string;
      };
      console.error('[EFI Pay] Erro ao consultar assinatura:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message
      });
      throw new Error(
        `Falha ao consultar assinatura na Efí Pay: ${axiosError.message}`
      );
    }
  }

  /**
   * Cancela uma assinatura
   */
  async cancelSubscription(
    subscriptionId: string
  ): Promise<{ message: string }> {
    await this.authenticate();

    try {
      const response = await this.apiClient.put(
        `/v1/plan/subscription/${subscriptionId}/cancel`
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: unknown; status?: number };
        message?: string;
      };
      console.error('[EFI Pay] Erro ao cancelar assinatura:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message
      });
      throw new Error(
        `Falha ao cancelar assinatura na Efí Pay: ${axiosError.message}`
      );
    }
  }

  /**
   * Lista planos de assinatura
   */
  async listPlans(
    offset: number = 0,
    limit: number = 20
  ): Promise<EfiListResponse<EfiPlanResponse['data']>> {
    await this.authenticate();

    try {
      const response = await this.apiClient.get('/v1/plans', {
        params: { offset, limit }
      });
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: unknown; status?: number };
        message?: string;
      };
      console.error('[EFI Pay] Erro ao listar planos:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message
      });
      throw new Error(
        `Falha ao listar planos na Efí Pay: ${axiosError.message}`
      );
    }
  }

  /**
   * Testa a conectividade com a API
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.authenticate();
      return {
        success: true,
        message: 'Conexão com EFI Pay estabelecida com sucesso'
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      return {
        success: false,
        message: `Falha na conexão: ${errorMessage}`
      };
    }
  }

  /**
   * Verifica o webhook da Efí Pay
   */
  static verifyWebhook(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  }
}

// Singleton para reutilizar a instância
export const efiPayService = new EfiPayService();
