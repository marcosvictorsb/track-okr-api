import * as dotenv from 'dotenv';
import { Resend } from 'resend';
import { logger } from '@configs/logger';

dotenv.config();

const resend = new Resend(process.env.API_KEY_RESEND);
const logging = logger;

export interface IEmailService {
  sendEmail(subject: string, to: string, emailContent: string): void;
}

export function EmailService<T extends new (...args: any[]) => {}>(Base: T) {
  return class extends Base {
    public async sendEmail(
      subject: string,
      to: string,
      emailContent: string
    ): Promise<void> {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to,
        subject,
        html: emailContent
      });
    }

    async sendInviteEmail(
      email: string,
      emailContent: string
    ): Promise<boolean> {
      try {
        logging.info('Enviando email de convite', { email });

        const response = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: 'marcosvictorsb@gmail.com',
          subject: `Convite para Ativação de Conta`,
          html: emailContent
        });

        console.log(response);

        return true;
      } catch (error) {
        logging.error('Erro ao enviar email de convite', {
          email,
          error: String(error)
        });
        return false;
      }
    }
  };
}
