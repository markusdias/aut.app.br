import { EmailTemplate } from '../NotificationService';

export class PlanChangedTemplate extends EmailTemplate {
  subject = 'Seu plano foi atualizado com sucesso';

  getHtmlContent(data: Record<string, any>): string {
    const isUpgrade = data.isUpgrade === "true";
    const changeType = isUpgrade ? 'atualizado' : 'alterado';
    
    return `
      <h1>Olá!</h1>
      <p>Seu plano do AtendChat foi ${changeType} com sucesso!</p>
      <p>Detalhes da mudança:</p>
      <ul>
        <li>Plano anterior: ${data.oldPlanName}</li>
        <li>Novo plano: ${data.newPlanName}</li>
        <li>Valor: R$ ${data.amount}/mês</li>
        <li>Data da mudança: ${new Date().toLocaleDateString('pt-BR')}</li>
      </ul>
      <p>Seu próximo ciclo de faturamento será em: ${new Date(data.nextBillingDate).toLocaleDateString('pt-BR')}</p>
      <p>Aproveite todos os recursos do seu ${isUpgrade ? 'novo' : ''} plano!</p>
      <p>Se tiver alguma dúvida, estamos à disposição.</p>
      <p>Atenciosamente,<br>Equipe AtendChat</p>
    `;
  }

  getTextContent(data: Record<string, any>): string {
    const isUpgrade = data.isUpgrade === "true";
    const changeType = isUpgrade ? 'atualizado' : 'alterado';

    return `
      Olá!

      Seu plano do AtendChat foi ${changeType} com sucesso!

      Detalhes da mudança:
      - Plano anterior: ${data.oldPlanName}
      - Novo plano: ${data.newPlanName}
      - Valor: R$ ${data.amount}/mês
      - Data da mudança: ${new Date().toLocaleDateString('pt-BR')}

      Seu próximo ciclo de faturamento será em: ${new Date(data.nextBillingDate).toLocaleDateString('pt-BR')}

      Aproveite todos os recursos do seu ${isUpgrade ? 'novo' : ''} plano!

      Se tiver alguma dúvida, estamos à disposição.

      Atenciosamente,
      Equipe AtendChat
    `;
  }
} 