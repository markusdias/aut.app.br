import { EmailTemplate } from '../NotificationService';

export class AccountBlockedTemplate extends EmailTemplate {
  subject = 'Sua conta foi bloqueada';

  getHtmlContent(data: Record<string, any>): string {
    const reason = data.isBanned ? 'banida' : 'temporariamente bloqueada';
    const actionText = data.isBanned 
      ? 'Entre em contato com nosso suporte para mais informações.'
      : 'O bloqueio é temporário e sua conta será desbloqueada automaticamente em breve.';

    return `
      <h1>Olá!</h1>
      <p>Sua conta do AtendChat foi ${reason}.</p>
      <p>Detalhes:</p>
      <ul>
        <li>Status: ${data.isBanned ? 'Banida' : 'Bloqueada'}</li>
        <li>Data: ${new Date().toLocaleDateString('pt-BR')}</li>
        ${data.reason ? `<li>Motivo: ${data.reason}</li>` : ''}
      </ul>
      <p>${actionText}</p>
      <p>Se você acredita que isso foi um erro, por favor entre em contato com nosso suporte.</p>
      <p>Atenciosamente,<br>Equipe AtendChat</p>
    `;
  }

  getTextContent(data: Record<string, any>): string {
    const reason = data.isBanned ? 'banida' : 'temporariamente bloqueada';
    const actionText = data.isBanned 
      ? 'Entre em contato com nosso suporte para mais informações.'
      : 'O bloqueio é temporário e sua conta será desbloqueada automaticamente em breve.';

    return `
      Olá!

      Sua conta do AtendChat foi ${reason}.

      Detalhes:
      - Status: ${data.isBanned ? 'Banida' : 'Bloqueada'}
      - Data: ${new Date().toLocaleDateString('pt-BR')}
      ${data.reason ? `- Motivo: ${data.reason}` : ''}

      ${actionText}

      Se você acredita que isso foi um erro, por favor entre em contato com nosso suporte.

      Atenciosamente,
      Equipe AtendChat
    `;
  }
} 