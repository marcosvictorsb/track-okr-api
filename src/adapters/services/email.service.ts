import * as dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

const resend = new Resend(process.env.API_KEY_RESEND);

export interface IEmailService {
  sendEmail(subject: string, to: string, emailContent: string): void;
}


export function EmailService<T extends new (...args: any[]) =>{}>(Base: T) {
  return class extends Base {
    public async sendEmail(subject: string, to: string,  emailContent: string): Promise<void> {      
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to,
        subject,
        html: emailContent
      });      
    }
  }
}