import { NotificationService } from './NotificationService';
import { SubscriptionCancelledTemplate } from './templates';

export async function testEmailService() {
  try {
    const notificationService = NotificationService.getInstance();
    
    await notificationService.sendEmail(
      new SubscriptionCancelledTemplate(),
      {
        userId: 'test-user',
        email: 'seu-email@exemplo.com', // Substitua pelo seu email
        templateData: {
          planName: 'Plano Teste'
        }
      }
    );

    console.log('✅ Email de teste enviado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao enviar email de teste:', error);
  }
} 