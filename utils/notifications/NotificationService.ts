import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export type NotificationData = {
  userId: string;
  email: string;
  templateData: Record<string, any>;
};

export abstract class EmailTemplate {
  abstract subject: string;
  abstract getHtmlContent(data: Record<string, any>): string;
  abstract getTextContent(data: Record<string, any>): string;
}

export class NotificationService {
  private static instance: NotificationService;
  
  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async sendEmail(template: EmailTemplate, data: NotificationData) {
    try {
      console.log('📧 Enviando email:', {
        to: data.email,
        subject: template.subject,
        templateData: data.templateData
      });

      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: data.email,
        subject: template.subject,
        html: template.getHtmlContent(data.templateData),
        text: template.getTextContent(data.templateData),
      });

      console.log('✅ Email enviado com sucesso:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      throw error;
    }
  }
} 