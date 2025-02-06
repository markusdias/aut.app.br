import { db } from "@/db/drizzle";
import { subscriptions, subscriptionPlans } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
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

    console.log('🔍 Buscando histórico para usuário:', userId);

    // Busca todas as mudanças de plano do usuário
    const userSubscriptions = await db
      .select({
        planId: subscriptions.planId,
        previousPlanId: subscriptions.previousPlanId,
        planChangedAt: subscriptions.planChangedAt,
      })
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(subscriptions.planChangedAt);

    console.log('📄 Histórico encontrado:', userSubscriptions);

    // Se não houver histórico, retorna array vazio
    if (!userSubscriptions || userSubscriptions.length === 0) {
      console.log('ℹ️ Nenhum histórico encontrado');
      return NextResponse.json({ history: [] });
    }

    // Coleta todos os IDs de planos únicos (tanto atuais quanto anteriores)
    const planIds = Array.from(new Set([
      ...userSubscriptions.map(s => s.planId),
      ...userSubscriptions.map(s => s.previousPlanId)
    ].filter(Boolean)));

    // Busca os detalhes dos planos
    const plans = await db
      .select({
        planId: subscriptionPlans.planId,
        name: subscriptionPlans.name,
        amount: subscriptionPlans.amount
      })
      .from(subscriptionPlans)
      .where(
        sql`${subscriptionPlans.planId} IN (${sql.join(
          planIds.map(id => sql`${id}`),
          sql`, `
        )})`
      );

    // Cria um mapa de planId -> planInfo para lookup eficiente
    const planMap = new Map(plans.map(p => [p.planId, p]));

    // Formata o histórico com os nomes dos planos
    const history = userSubscriptions
      .filter(sub => sub.previousPlanId && sub.planChangedAt)
      .map(sub => {
        const oldPlan = planMap.get(sub.previousPlanId || "");
        const newPlan = planMap.get(sub.planId || "");

        // Determina se foi upgrade baseado no valor dos planos
        const oldAmount = oldPlan ? parseFloat(oldPlan.amount || "0") : 0;
        const newAmount = newPlan ? parseFloat(newPlan.amount || "0") : 0;

        return {
          oldPlanName: oldPlan?.name || "Plano não encontrado",
          newPlanName: newPlan?.name || "Plano não encontrado",
          changedAt: sub.planChangedAt?.toISOString() || "",
          isUpgrade: newAmount > oldAmount
        };
      });

    console.log('✅ Histórico formatado:', history);

    return NextResponse.json({ history });
  } catch (error) {
    console.error("❌ Erro ao buscar histórico de mudanças:", error);
    return NextResponse.json(
      { 
        error: "Erro ao buscar histórico de mudanças",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 