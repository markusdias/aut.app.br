import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db/drizzle";
import { subscriptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendSubscriptionCancelScheduledNotification } from '@/utils/notifications/sendNotifications';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const { cancellationReason } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID não fornecido" },
        { status: 400 }
      );
    }

    // Busca a assinatura ativa do usuário
    const activeSubscription = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, "active")
        )
      )
      .limit(1);

    if (!activeSubscription || activeSubscription.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma assinatura ativa encontrada" },
        { status: 404 }
      );
    }

    const subscription = activeSubscription[0];

    // Atualiza a assinatura no Stripe para cancelar no fim do período
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.subscriptionId,
      {
        cancel_at_period_end: true,
        metadata: {
          cancellationReason,
          cancelRequestedAt: new Date().toISOString()
        }
      }
    );

    // Atualiza o registro no banco de dados
    await db
      .update(subscriptions)
      .set({
        cancelAtPeriodEnd: true,
        cancellationReason,
        cancelRequestedAt: new Date()
      })
      .where(eq(subscriptions.id, subscription.id));

    // Envia notificação ao usuário
    if (subscription.email) {
      await sendSubscriptionCancelScheduledNotification({
        userId,
        email: subscription.email,
        effectiveCancellationDate: new Date(updatedSubscription.current_period_end * 1000),
        planId: subscription.planId || ""
      });
    }

    return NextResponse.json({
      message: "Assinatura programada para cancelamento",
      effectiveCancellationDate: new Date(updatedSubscription.current_period_end * 1000)
    });
  } catch (error) {
    console.error("Erro ao cancelar assinatura:", error);
    return NextResponse.json(
      { error: "Erro ao processar cancelamento da assinatura" },
      { status: 500 }
    );
  }
} 