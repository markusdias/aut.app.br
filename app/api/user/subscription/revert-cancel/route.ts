import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db/drizzle";
import { subscriptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendSubscriptionCancelRevertedNotification } from "@/utils/notifications/sendNotifications";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID não fornecido" },
        { status: 400 }
      );
    }

    // Busca a assinatura do usuário
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, "active")
        )
      )
      .limit(1);

    if (!subscription || subscription.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma assinatura ativa encontrada" },
        { status: 404 }
      );
    }

    const sub = subscription[0];

    if (!sub.cancelAtPeriodEnd) {
      return NextResponse.json(
        { error: "Esta assinatura não está agendada para cancelamento" },
        { status: 400 }
      );
    }

    // Atualiza a assinatura no Stripe
    await stripe.subscriptions.update(sub.subscriptionId, {
      cancel_at_period_end: false,
      metadata: {
        cancelRequestedAt: null,
        cancellationReason: null
      }
    });

    // Atualiza o registro no banco de dados
    await db
      .update(subscriptions)
      .set({
        cancelAtPeriodEnd: false,
        cancellationReason: null,
        cancelRequestedAt: null
      })
      .where(eq(subscriptions.id, sub.id));

    // Envia email de confirmação
    if (sub.email) {
      await sendSubscriptionCancelRevertedNotification({
        userId: sub.userId || "",
        email: sub.email,
        planId: sub.planId || ""
      });
    }

    return NextResponse.json({
      message: "Cancelamento revertido com sucesso"
    });
  } catch (error) {
    console.error("Erro ao reverter cancelamento:", error);
    return NextResponse.json(
      { error: "Erro ao processar reversão do cancelamento" },
      { status: 500 }
    );
  }
} 