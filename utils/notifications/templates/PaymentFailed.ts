import { EmailTemplate } from '../NotificationService';

export class PaymentFailedTemplate extends EmailTemplate {
  subject = 'Falha no processamento do pagamento';

  getHtmlContent(data: Record<string, any>): string {
    return `
      <h1>Olá!</h1>
      <p>Identificamos uma falha no processamento do pagamento da sua assinatura do AtendChat.</p>
      <p>Detalhes:</p>
      <ul>
        <li>Plano: ${data.planName}</li>
        <li>Valor: R$ ${data.amount}</li>
        <li>Data da tentativa: ${new Date().toLocaleDateString('pt-BR')}</li>
      </ul>
      <p>Por favor, verifique:</p>
      <ul>
        <li>Se há limite disponível no cartão</li>
        <li>Se os dados do cartão estão corretos</li>
        <li>Se não há bloqueio do banco</li>
      </ul>
      <p>Uma nova tentativa será feita em breve. Você pode atualizar seus dados de pagamento a qualquer momento em sua conta.</p>
      <p>Se precisar de ajuda, estamos à disposição.</p>
      <p>Atenciosamente,<br>Equipe AtendChat</p>
    `;
  }

  getTextContent(data: Record<string, any>): string {
    return `
      Olá!

      Identificamos uma falha no processamento do pagamento da sua assinatura do AtendChat.

      Detalhes:
      - Plano: ${data.planName}
      - Valor: R$ ${data.amount}
      - Data da tentativa: ${new Date().toLocaleDateString('pt-BR')}

      Por favor, verifique:
      - Se há limite disponível no cartão
      - Se os dados do cartão estão corretos
      - Se não há bloqueio do banco

      Uma nova tentativa será feita em breve. Você pode atualizar seus dados de pagamento a qualquer momento em sua conta.

      Se precisar de ajuda, estamos à disposição.

      Atenciosamente,
      Equipe AtendChat
    `;
  }
} 