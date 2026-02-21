export class DiscordNotificationService {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async sendSupportContactNotification(supportData: {
    id?: number;
    name: string;
    contact_preference: string;
    contact_value: string;
    message: string;
    priority: string;
    company_id?: number | null;
    user_id?: number | null;
    created_at?: Date;
  }): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        '📝 Discord notification desabilitada em ambiente de desenvolvimento'
      );
      return;
    }

    try {
      const embed = {
        title: '🆘 Novo Contato de Suporte Recebido',
        color: this.getPriorityColor(supportData.priority),
        fields: [
          {
            name: '👤 Nome',
            value: supportData.name || 'Não informado',
            inline: true
          },
          {
            name: '📧 Contato',
            value: `${supportData.contact_preference}: ${supportData.contact_value}`,
            inline: true
          },
          {
            name: '⚡ Prioridade',
            value:
              this.getPriorityEmoji(supportData.priority) +
              ' ' +
              supportData.priority.toUpperCase(),
            inline: true
          },
          {
            name: '🏢 Company ID',
            value: supportData.company_id?.toString() || 'Não informado',
            inline: true
          },
          {
            name: '👥 User ID',
            value: supportData.user_id?.toString() || 'Não informado',
            inline: true
          },
          {
            name: '🆔 Ticket ID',
            value: supportData.id?.toString() || 'Pendente',
            inline: true
          },
          {
            name: '💬 Mensagem',
            value: this.truncateMessage(supportData.message),
            inline: false
          }
        ],
        timestamp:
          supportData.created_at?.toISOString() || new Date().toISOString(),
        footer: {
          text: 'TrackOKR - Sistema de Suporte',
          icon_url: 'https://trackokr.com/favicon.ico'
        }
      };

      const payload = {
        username: 'TrackOKR Support Bot',
        avatar_url: 'https://trackokr.com/favicon.ico',
        embeds: [embed]
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(
          `Discord API returned ${response.status}: ${response.statusText}`
        );
      }

      console.log('✅ Notificação de suporte enviada para Discord com sucesso');
    } catch (error) {
      console.error(
        '❌ Erro ao enviar notificação de suporte para Discord:',
        error
      );
    }
  }

  async sendKirvanoWebhookNotification(webhookData: {
    event?: string;
    status?: string;
    customer_email?: string;
    customer_document?: string;
    payment?: {
      method?: string;
      brand?: string;
      installments?: number;
      finished_at?: string;
    };
    products?: Array<{
      id: string;
      name: string;
      offer_id?: string;
      offer_name?: string;
      price?: string;
    }>;
  }): Promise<void> {
    try {
      const productsText =
        webhookData.products && webhookData.products.length > 0
          ? webhookData.products
              .map((p) => `• ${p.offer_name || p.name} (${p.price || 'N/A'})`)
              .join('\n')
          : 'Nenhum produto informado';

      const embed = {
        title: '💳 Novo Evento Kirvano Webhook Recebido',
        color: this.getEventColor(webhookData.event || ''),
        fields: [
          {
            name: '📋 Evento',
            value: webhookData.event || 'Desconhecido',
            inline: true
          },
          {
            name: '✅ Status',
            value: webhookData.status || 'Desconhecido',
            inline: true
          },
          {
            name: '📧 Email do Cliente',
            value: webhookData.customer_email || 'Não informado',
            inline: true
          },
          {
            name: '🆔 Documento do Cliente',
            value: webhookData.customer_document || 'Não informado',
            inline: true
          },
          {
            name: '💰 Método de Pagamento',
            value: webhookData.payment?.method || 'Não informado',
            inline: true
          },
          {
            name: '🏦 Bandeira',
            value: webhookData.payment?.brand || 'Não informado',
            inline: true
          },
          {
            name: '📦 Produtos',
            value: productsText,
            inline: false
          }
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'TrackOKR - Kirvano Webhook',
          icon_url: 'https://trackokr.com/favicon.ico'
        }
      };

      const payload = {
        username: 'TrackOKR Kirvano Webhook Bot',
        avatar_url: 'https://trackokr.com/favicon.ico',
        embeds: [embed]
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(
          `Discord API returned ${response.status}: ${response.statusText}`
        );
      }

      console.log('✅ Notificação Kirvano enviada para Discord com sucesso');
    } catch (error) {
      console.error(
        '❌ Erro ao enviar notificação Kirvano para Discord:',
        error
      );
    }
  }

  private getPriorityColor(priority: string): number {
    const colors = {
      low: 0x28a745, // Verde
      medium: 0xffc107, // Amarelo
      high: 0xfd7e14, // Laranja
      urgent: 0xdc3545 // Vermelho
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  }

  private getEventColor(event: string): number {
    const colors: { [key: string]: number } = {
      SALE_APPROVED: 0x28a745, // Verde
      SALE_REFUSED: 0xdc3545, // Vermelho
      SALE_REFUNDED: 0xff6b6b, // Vermelho claro
      SUBSCRIPTION_RENEWED: 0x4ecdc4, // Teal
      SUBSCRIPTION_EXPIRED: 0xffa07a, // Salmão
      SUBSCRIPTION_CANCELED: 0xa9a9a9, // Cinza
      ABANDONED_CART: 0xffc107 // Amarelo
    };
    return colors[event] || 0x3498db; // Azul padrão
  }

  private getPriorityEmoji(priority: string): string {
    const emojis = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      urgent: '🔴'
    };
    return emojis[priority as keyof typeof emojis] || '🟡';
  }

  private truncateMessage(message: string, maxLength: number = 1000): string {
    if (message.length <= maxLength) {
      return message;
    }
    return message.substring(0, maxLength - 3) + '...';
  }
}
