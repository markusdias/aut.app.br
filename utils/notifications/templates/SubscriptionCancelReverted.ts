import { EmailTemplate } from '../NotificationService';

type TemplateData = {
  planName: string;
};

export class SubscriptionCancelReverted implements EmailTemplate {
  constructor(private readonly email: string) {}

  subject = "Sua assinatura foi mantida com sucesso!";

  getHtmlContent(data: TemplateData): string {
    return `
      <h1>Que bom que você decidiu ficar! 🎉</h1>
      <p>Olá,</p>
      <p>Confirmamos que sua assinatura do plano <strong>${data.planName}</strong> continuará ativa normalmente.</p>
      <p>Você continuará tendo acesso a todos os recursos e benefícios do seu plano atual.</p>
      <p>Estamos sempre trabalhando para melhorar nossos serviços e trazer mais valor para você.</p>
      <p>Se precisar de qualquer ajuda, não hesite em nos contatar.</p>
      <p>Atenciosamente,<br>Equipe AtendChat</p>
    `;
  }

  getTextContent(data: TemplateData): string {
    return `
      Que bom que você decidiu ficar! 🎉

      Olá,

      Confirmamos que sua assinatura do plano ${data.planName} continuará ativa normalmente.

      Você continuará tendo acesso a todos os recursos e benefícios do seu plano atual.

      Estamos sempre trabalhando para melhorar nossos serviços e trazer mais valor para você.

      Se precisar de qualquer ajuda, não hesite em nos contatar.

      Atenciosamente,
      Equipe AtendChat
    `;
  }
} 