import { EmailTemplate } from '../NotificationService';

export class SubscriptionCancelledTemplate extends EmailTemplate {
  subject = 'Sua assinatura foi cancelada';

  getHtmlContent(data: Record<string, any>): string {
    return `
      <h1>Olá!</h1>
      <p>Sua assinatura do AtendChat foi cancelada com sucesso.</p>
      <p>Detalhes:</p>
      <ul>
        <li>Plano: ${data.planName}</li>
        <li>Data de cancelamento: ${new Date().toLocaleDateString('pt-BR')}</li>
      </ul>
      <p>Esperamos que você volte em breve!</p>
      <p>Se você tiver alguma dúvida, não hesite em nos contatar.</p>
      <p>Atenciosamente,<br>Equipe AtendChat</p>
    `;
  }

  getTextContent(data: Record<string, any>): string {
    return `
      Olá!

      Sua assinatura do AtendChat foi cancelada com sucesso.

      Detalhes:
      - Plano: ${data.planName}
      - Data de cancelamento: ${new Date().toLocaleDateString('pt-BR')}

      Esperamos que você volte em breve!

      Se você tiver alguma dúvida, não hesite em nos contatar.

      Atenciosamente,
      Equipe AtendChat
    `;
  }
} 