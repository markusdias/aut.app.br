import { NotificationService, NotificationData } from './NotificationService';
import {
  SubscriptionCancelledTemplate,
  PaymentFailedTemplate,
  AccountBlockedTemplate,
  PlanChangedTemplate
} from './templates';
import { db } from '@/db/drizzle';
import { subscriptionPlans } from '@/db/schema';
import { eq } from 'drizzle-orm';

const notificationService = NotificationService.getInstance();

export async function sendSubscriptionCancelledNotification(data: {
  userId: string;
  email: string;
  planId: string;
}) {
  try {
    // Busca informações do plano
    const plan = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.planId, data.planId))
      .limit(1);

    const notificationData: NotificationData = {
      userId: data.userId,
      email: data.email,
      templateData: {
        planName: plan[0]?.name || 'Não especificado'
      }
    };

    await notificationService.sendEmail(
      new SubscriptionCancelledTemplate(),
      notificationData
    );
  } catch (error) {
    console.error('❌ Erro ao enviar notificação de cancelamento:', error);
  }
}

export async function sendPaymentFailedNotification(data: {
  userId: string;
  email: string;
  planId: string;
  amount: string;
}) {
  try {
    const plan = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.planId, data.planId))
      .limit(1);

    const notificationData: NotificationData = {
      userId: data.userId,
      email: data.email,
      templateData: {
        planName: plan[0]?.name || 'Não especificado',
        amount: data.amount
      }
    };

    await notificationService.sendEmail(
      new PaymentFailedTemplate(),
      notificationData
    );
  } catch (error) {
    console.error('❌ Erro ao enviar notificação de falha no pagamento:', error);
  }
}

export async function sendAccountBlockedNotification(data: {
  userId: string;
  email: string;
  isBanned: boolean;
  reason?: string;
}) {
  try {
    const notificationData: NotificationData = {
      userId: data.userId,
      email: data.email,
      templateData: {
        isBanned: data.isBanned,
        reason: data.reason
      }
    };

    await notificationService.sendEmail(
      new AccountBlockedTemplate(),
      notificationData
    );
  } catch (error) {
    console.error('❌ Erro ao enviar notificação de conta bloqueada:', error);
  }
}

export async function sendPlanChangedNotification(data: {
  userId: string;
  email: string;
  oldPlanId: string;
  newPlanId: string;
  isUpgrade: string;
  nextBillingDate: Date;
}) {
  try {
    // Busca informações dos planos
    const [oldPlan, newPlan] = await Promise.all([
      db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.planId, data.oldPlanId))
        .limit(1),
      db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.planId, data.newPlanId))
        .limit(1)
    ]);

    const notificationData: NotificationData = {
      userId: data.userId,
      email: data.email,
      templateData: {
        oldPlanName: oldPlan[0]?.name || 'Não especificado',
        newPlanName: newPlan[0]?.name || 'Não especificado',
        amount: newPlan[0]?.amount || '0',
        isUpgrade: data.isUpgrade,
        nextBillingDate: data.nextBillingDate.toISOString()
      }
    };

    await notificationService.sendEmail(
      new PlanChangedTemplate(),
      notificationData
    );
  } catch (error) {
    console.error('❌ Erro ao enviar notificação de mudança de plano:', error);
  }
} 