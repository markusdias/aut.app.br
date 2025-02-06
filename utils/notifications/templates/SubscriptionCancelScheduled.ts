import { formatDate } from '@/utils/format';
import { EmailTemplate } from '../NotificationService';

type TemplateData = {
  effectiveCancellationDate: Date;
};

export class SubscriptionCancelScheduled implements EmailTemplate {
  constructor(private readonly email: string) {}

  subject = "Cancelamento de Assinatura Agendado";

  getHtmlContent(data: TemplateData): string {
    const formattedDate = formatDate(data.effectiveCancellationDate);

    return `
      <h1>Cancelamento de Assinatura Agendado</h1>
      <p>Olá,</p>
      <p>Confirmamos que sua solicitação de cancelamento foi recebida.</p>
      <p>Sua assinatura permanecerá ativa até ${formattedDate}, quando será cancelada automaticamente.</p>
      <p>Durante este período, você continuará tendo acesso completo a todos os recursos do seu plano atual.</p>
      <p>Se desejar reverter o cancelamento antes desta data, você pode fazer isso a qualquer momento através das configurações da sua conta.</p>
      <p>Caso tenha alguma dúvida, não hesite em nos contatar.</p>
      <p>Atenciosamente,<br>Equipe AtendChat</p>
    `;
  }

  getTextContent(data: TemplateData): string {
    const formattedDate = formatDate(data.effectiveCancellationDate);

    return `
      Cancelamento de Assinatura Agendado

      Olá,

      Confirmamos que sua solicitação de cancelamento foi recebida.
      
      Sua assinatura permanecerá ativa até ${formattedDate}, quando será cancelada automaticamente.
      
      Durante este período, você continuará tendo acesso completo a todos os recursos do seu plano atual.
      
      Se desejar reverter o cancelamento antes desta data, você pode fazer isso a qualquer momento através das configurações da sua conta.
      
      Caso tenha alguma dúvida, não hesite em nos contatar.
      
      Atenciosamente,
      Equipe AtendChat
    `;
  }
} 