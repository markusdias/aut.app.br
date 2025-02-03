import { db } from "@/db/drizzle";
import { subscriptions, users, subscriptionPlans } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID não fornecido" },
        { status: 400 }
      );
    }

    console.log('DEBUG - Buscando usuário:', userId);

    // Busca o usuário e sua assinatura
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);

    if (!userData || userData.length === 0) {
      console.log('DEBUG - Usuário não encontrado');
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const user = userData[0];
    console.log('DEBUG - Dados do usuário:', {
      userId: user.userId,
      email: user.email,
      subscription: user.subscription
    });

    // Se o usuário não tem assinatura, busca na tabela subscriptions
    if (!user.subscription) {
      console.log('DEBUG - Usuário sem assinatura no campo subscription, verificando na tabela subscriptions');
      
      // Busca os detalhes da assinatura ATIVA
      const subscriptionData = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.userId, userId),
            eq(subscriptions.status, "active")
          )
        )
        .limit(1);

      console.log('DEBUG - Resultado da busca na tabela subscriptions:', subscriptionData.length > 0 ? {
        id: subscriptionData[0].id,
        userId: subscriptionData[0].userId,
        planId: subscriptionData[0].planId,
        status: subscriptionData[0].status
      } : 'Nenhuma assinatura encontrada');

      if (subscriptionData && subscriptionData.length > 0) {
        // Atualiza o campo subscription do usuário
        await db
          .update(users)
          .set({ subscription: subscriptionData[0].status })
          .where(eq(users.userId, userId));

        console.log('DEBUG - Campo subscription do usuário atualizado para:', subscriptionData[0].status);

        // Continua o fluxo com a assinatura encontrada
        const subscription = subscriptionData[0];
        const planData = subscription.planId ? await db
          .select()
          .from(subscriptionPlans)
          .where(eq(subscriptionPlans.planId, subscription.planId))
          .limit(1) : [];

        console.log('DEBUG - Plano encontrado:', planData[0] ? {
          id: planData[0].id,
          planId: planData[0].planId,
          name: planData[0].name,
          interval: planData[0].interval,
          amount: planData[0].amount
        } : 'Nenhum plano encontrado');

        // Se encontrou o plano, transforma no mesmo formato dos outros planos
        const currentPlan = planData[0] ? {
          ...planData[0],
          planId: planData[0].planId,
          monthlyPriceId: planData[0].interval === "month" ? subscription.planId : undefined,
          yearlyPriceId: planData[0].interval === "year" ? subscription.planId : undefined,
          monthlyPrice: planData[0].interval === "month" ? planData[0].amount : undefined,
          yearlyPrice: planData[0].interval === "year" ? planData[0].amount : undefined,
          hasMonthlyPrice: planData[0].interval === "month" && planData[0].amount !== "0",
          hasYearlyPrice: planData[0].interval === "year" && planData[0].amount !== "0",
          metadata: planData[0].metadata as { benefits?: string; userDescription?: string; } | null,
          monthlyMetadata: planData[0].interval === "month" ? planData[0].metadata : undefined,
          yearlyMetadata: planData[0].interval === "year" ? planData[0].metadata : undefined,
        } : null;

        return NextResponse.json({
          user,
          subscription,
          currentPlan,
        });
      }

      return NextResponse.json({
        user,
        subscription: null,
        currentPlan: null,
      });
    }

    // Busca os detalhes da assinatura ATIVA
    const subscriptionData = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, "active")
        )
      )
      .limit(1);

    if (!subscriptionData || subscriptionData.length === 0) {
      return NextResponse.json({
        user,
        subscription: null,
        currentPlan: null,
      });
    }

    const subscription = subscriptionData[0];

    console.log('DEBUG - Subscription encontrada:', {
      id: subscription.id,
      userId: subscription.userId,
      planId: subscription.planId,
      status: subscription.status
    });

    // Busca os detalhes do plano atual usando o planId
    const planData = subscription.planId ? await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.planId, subscription.planId))
      .limit(1) : [];

    console.log('DEBUG - Plano encontrado:', planData[0] ? {
      id: planData[0].id,
      planId: planData[0].planId,
      name: planData[0].name,
      interval: planData[0].interval,
      amount: planData[0].amount
    } : 'Nenhum plano encontrado');

    // Se encontrou o plano, transforma no mesmo formato dos outros planos
    const currentPlan = planData[0] ? {
      ...planData[0],
      planId: planData[0].planId,
      monthlyPriceId: planData[0].interval === "month" ? subscription.planId : undefined,
      yearlyPriceId: planData[0].interval === "year" ? subscription.planId : undefined,
      monthlyPrice: planData[0].interval === "month" ? planData[0].amount : undefined,
      yearlyPrice: planData[0].interval === "year" ? planData[0].amount : undefined,
      hasMonthlyPrice: planData[0].interval === "month" && planData[0].amount !== "0",
      hasYearlyPrice: planData[0].interval === "year" && planData[0].amount !== "0",
      metadata: planData[0].metadata as { benefits?: string; userDescription?: string; } | null,
      monthlyMetadata: planData[0].interval === "month" ? planData[0].metadata : undefined,
      yearlyMetadata: planData[0].interval === "year" ? planData[0].metadata : undefined,
    } : null;

    console.log('DEBUG - Current Plan transformado:', currentPlan ? {
      name: currentPlan.name,
      planId: currentPlan.planId,
      monthlyPriceId: currentPlan.monthlyPriceId,
      yearlyPriceId: currentPlan.yearlyPriceId,
      interval: planData[0].interval
    } : 'Nenhum plano atual');

    console.log('DEBUG - Dados retornados:', {
      subscription: {
        userId: subscription.userId,
        planId: subscription.planId,
        status: subscription.status
      },
      currentPlan: currentPlan ? {
        name: currentPlan.name,
        planId: currentPlan.planId,
        monthlyPriceId: currentPlan.monthlyPriceId,
        yearlyPriceId: currentPlan.yearlyPriceId
      } : null
    });

    return NextResponse.json({
      user,
      subscription,
      currentPlan,
    });
  } catch (error) {
    console.error("Erro ao buscar informações do usuário:", error);
    return NextResponse.json(
      { error: "Erro ao buscar informações do usuário" },
      { status: 500 }
    );
  }
} 