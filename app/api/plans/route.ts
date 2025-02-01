import { getSubscriptionPlans } from "@/utils/data/plans/getSubscriptionPlans";
import { NextResponse } from "next/server";
import { DatabaseManager } from "@/scripts/db-manager";

export async function GET() {
  try {
    // Tenta buscar os planos primeiro
    let plans = await getSubscriptionPlans();
    
    // Se não houver planos, tenta sincronizar com o Stripe
    if (!plans || plans.length === 0) {
      console.log("🔄 Nenhum plano encontrado. Tentando sincronizar com o Stripe...");
      const manager = new DatabaseManager();
      try {
        await manager.syncStripePlans();
        // Busca os planos novamente após a sincronização
        plans = await getSubscriptionPlans();
      } finally {
        await manager.close();
      }
    }
    
    return NextResponse.json({
      plans,
      message: "Planos carregados com sucesso",
    });
  } catch (error) {
    console.error("❌ Erro ao buscar planos:", error);
    return NextResponse.json(
      {
        error: "Erro ao buscar planos de assinatura",
      },
      { status: 500 }
    );
  }
} 