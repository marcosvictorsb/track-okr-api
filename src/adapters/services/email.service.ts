import * as dotenv from 'dotenv';
import { Resend } from 'resend';
import { logger } from '@configs/logger';

dotenv.config();

const resend = new Resend(process.env.API_KEY_RESEND);
const logging = logger;

const isProduction = process.env.NODE_ENV === 'production';

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
      try {
        await resend.emails.send({
          from: 'contato@gunno.io',
          to: isProduction ? to : 'contato@gunno.io',
          subject,
          html: emailContent
        });
        logging.info('Email enviado com sucesso', { to });
      } catch (error) {
        logging.error('Erro ao enviar email', {
          to,
          error: String(error)
        });
      }
    }

    async sendInviteEmail(
      email: string,
      emailContent: string
    ): Promise<boolean> {
      try {
        logging.info('Enviando email de convite', { email });

        const response = await resend.emails.send({
          from: 'contato@gunno.io',
          to: isProduction ? email : 'contato@gunno.io',
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
