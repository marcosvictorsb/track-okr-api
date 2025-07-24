import 'dotenv/config';
import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

export interface EfiPlanData {
  name: string;
  interval: number; // em dias (30 para mensal, 365 para anual)
  repeats?: number; // 0 para indefinido
  value: number; // valor em centavos
  metadata?: {
    custom_id?: string;
    notification_url?: string;
  };
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

export class EfiPayService {
  private apiClient: AxiosInstance;
  private accessToken: string = '';
  private tokenExpiresAt: Date = new Date();

  constructor() {
    this.apiClient = axios.create({
      baseURL:
        process.env.EFI_SANDBOX === 'true'
          ? 'https://pix-h.api.efipay.com.br'
          : 'https://pix.api.efipay.com.br',
      timeout: 30000
    });
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
        throw new Error('Credenciais da Efí Pay não configuradas');
      }

      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
        'base64'
      );

      const response = await this.apiClient.post(
        '/oauth/token',
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
      this.tokenExpiresAt = new Date(
        Date.now() + (response.data.expires_in - 300) * 1000
      );

      // Configurar interceptor para adicionar o token em todas as requisições
      this.apiClient.defaults.headers.common['Authorization'] =
        `Bearer ${this.accessToken}`;
    } catch (error: any) {
      console.error(
        'Erro na autenticação Efí Pay:',
        error.response?.data || error.message
      );
      throw new Error('Falha na autenticação com a Efí Pay');
    }
  }

  /**
   * Cria um plano de assinatura na Efí Pay
   */
  async createPlan(planData: EfiPlanData): Promise<any> {
    await this.authenticate();

    try {
      const response = await this.apiClient.post('/v1/plan', planData);
      return response.data;
    } catch (error: any) {
      console.error(
        'Erro ao criar plano na Efí:',
        error.response?.data || error.message
      );
      throw new Error('Falha ao criar plano na Efí Pay');
    }
  }

  /**
   * Cria uma assinatura na Efí Pay
   */
  async createSubscription(
    subscriptionData: EfiSubscriptionData
  ): Promise<any> {
    await this.authenticate();

    try {
      const response = await this.apiClient.post(
        '/v1/plan/subscription',
        subscriptionData
      );
      return response.data;
    } catch (error: any) {
      console.error(
        'Erro ao criar assinatura na Efí:',
        error.response?.data || error.message
      );
      throw new Error('Falha ao criar assinatura na Efí Pay');
    }
  }

  /**
   * Cria uma cobrança única na Efí Pay
   */
  async createCharge(chargeData: EfiChargeData): Promise<any> {
    await this.authenticate();

    try {
      const response = await this.apiClient.post('/v1/charge', chargeData);
      return response.data;
    } catch (error: any) {
      console.error(
        'Erro ao criar cobrança na Efí:',
        error.response?.data || error.message
      );
      throw new Error('Falha ao criar cobrança na Efí Pay');
    }
  }

  /**
   * Consulta o status de uma cobrança
   */
  async getCharge(chargeId: string): Promise<any> {
    await this.authenticate();

    try {
      const response = await this.apiClient.get(`/v1/charge/${chargeId}`);
      return response.data;
    } catch (error: any) {
      console.error(
        'Erro ao consultar cobrança na Efí:',
        error.response?.data || error.message
      );
      throw new Error('Falha ao consultar cobrança na Efí Pay');
    }
  }

  /**
   * Consulta o status de uma assinatura
   */
  async getSubscription(subscriptionId: string): Promise<any> {
    await this.authenticate();

    try {
      const response = await this.apiClient.get(
        `/v1/plan/subscription/${subscriptionId}`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        'Erro ao consultar assinatura na Efí:',
        error.response?.data || error.message
      );
      throw new Error('Falha ao consultar assinatura na Efí Pay');
    }
  }

  /**
   * Cancela uma assinatura
   */
  async cancelSubscription(subscriptionId: string): Promise<any> {
    await this.authenticate();

    try {
      const response = await this.apiClient.put(
        `/v1/plan/subscription/${subscriptionId}/cancel`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        'Erro ao cancelar assinatura na Efí:',
        error.response?.data || error.message
      );
      throw new Error('Falha ao cancelar assinatura na Efí Pay');
    }
  }

  /**
   * Lista planos de assinatura
   */
  async listPlans(offset: number = 0, limit: number = 20): Promise<any> {
    await this.authenticate();

    try {
      const response = await this.apiClient.get('/v1/plans', {
        params: { offset, limit }
      });
      return response.data;
    } catch (error: any) {
      console.error(
        'Erro ao listar planos na Efí:',
        error.response?.data || error.message
      );
      throw new Error('Falha ao listar planos na Efí Pay');
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
