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

  private getPriorityColor(priority: string): number {
    const colors = {
      low: 0x28a745, // Verde
      medium: 0xffc107, // Amarelo
      high: 0xfd7e14, // Laranja
      urgent: 0xdc3545 // Vermelho
    };
    return colors[priority as keyof typeof colors] || colors.medium;
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
