import { db } from "@/db/drizzle";
import { subscriptionPlans } from "@/db/schema";
import { desc } from "drizzle-orm";

export type SubscriptionPlan = {
  id: number;
  planId: string | null;
  name: string | null;
  description: string | null;
  amount: string | null;
  currency: string | null;
  interval: string | null;
  monthlyPriceId?: string | null;
  yearlyPriceId?: string | null;
  monthlyPrice?: string | null;
  yearlyPrice?: string | null;
  active: boolean | null | undefined;
  hasMonthlyPrice?: boolean;
  hasYearlyPrice?: boolean;
  metadata?: {
    benefits?: string;
    userDescription?: string;
  } | null;
  monthlyMetadata?: {
    benefits?: string;
    userDescription?: string;
  } | null;
  yearlyMetadata?: {
    benefits?: string;
    userDescription?: string;
  } | null;
};

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    // Busca os planos mais recentes primeiro
    const plans = await db
      .select()
      .from(subscriptionPlans)
      .orderBy(desc(subscriptionPlans.createdTime));

    // Se não houver planos, retorna array vazio
    if (!plans || plans.length === 0) {
      console.log("⚠️ Nenhum plano encontrado no banco de dados");
      return [];
    }

    // Agrupa os planos por nome do produto
    const groupedPlans = plans.reduce((acc: { [key: string]: SubscriptionPlan }, plan) => {
      // Ignora planos inativos ou com valor zero
      if (!plan.name || !plan.planId || !plan.amount || !plan.currency || !plan.interval || !plan.active || plan.amount === "0") {
        return acc;
      }

      const metadata = plan.metadata as { benefits?: string; userDescription?: string; } | null;

      if (!acc[plan.name]) {
        acc[plan.name] = {
          ...plan,
          metadata,
          monthlyPriceId: plan.interval === "month" ? plan.planId : undefined,
          yearlyPriceId: plan.interval === "year" ? plan.planId : undefined,
          monthlyPrice: plan.interval === "month" ? plan.amount : undefined,
          yearlyPrice: plan.interval === "year" ? plan.amount : undefined,
          hasMonthlyPrice: plan.interval === "month" && plan.amount !== "0",
          hasYearlyPrice: plan.interval === "year" && plan.amount !== "0",
          monthlyMetadata: plan.interval === "month" ? metadata : undefined,
          yearlyMetadata: plan.interval === "year" ? metadata : undefined,
        };
      } else {
        if (plan.interval === "month" && plan.amount !== "0") {
          acc[plan.name].monthlyPriceId = plan.planId;
          acc[plan.name].monthlyPrice = plan.amount;
          acc[plan.name].hasMonthlyPrice = true;
          acc[plan.name].monthlyMetadata = metadata;
        } else if (plan.interval === "year" && plan.amount !== "0") {
          acc[plan.name].yearlyPriceId = plan.planId;
          acc[plan.name].yearlyPrice = plan.amount;
          acc[plan.name].hasYearlyPrice = true;
          acc[plan.name].yearlyMetadata = metadata;
        }
      }

      return acc;
    }, {});

    // Filtra apenas planos ativos e com pelo menos um preço válido
    const activePlans = Object.values(groupedPlans).filter(plan => 
      plan.active === true && (
        (plan.hasMonthlyPrice && plan.monthlyPrice && parseFloat(plan.monthlyPrice) > 0) || 
        (plan.hasYearlyPrice && plan.yearlyPrice && parseFloat(plan.yearlyPrice) > 0)
      )
    );

    return activePlans;
  } catch (error) {
    console.error("❌ Erro ao buscar planos:", error);
    return [];
  }
} 