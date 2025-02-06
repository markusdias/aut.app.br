import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { SubscriptionPlan } from "@/utils/data/plans/getSubscriptionPlans";
import axios from "axios";
import { useRouter } from "next/navigation";

export type Subscription = {
  id: number;
  userId: string;
  status: string;
  planId: string;
  customerId: string;
  createdAt: string;
  updatedAt: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  defaultPaymentMethodId?: string;
  previousPlanId?: string;
  planChangedAt?: string;
  canceledAt?: string;
  cancelAtPeriodEnd?: boolean;
  cancellationReason?: string | null;
  cancelRequestedAt?: string | null;
};

export type UserSubscriptionInfo = {
  user: {
    id: string;
    emailAddresses: Array<{ emailAddress: string }>;
  };
  subscription: Subscription;
  currentPlan: SubscriptionPlan | null;
};

export type PlansResponse = {
  plans: SubscriptionPlan[];
};

export function usePricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userInfo, setUserInfo] = useState<UserSubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('DEBUG - usePricing - Iniciando carregamento:', {
          userId: user?.id,
          isAuthenticated: !!user
        });

        // Carrega os planos e informações do usuário em paralelo
        const [plansRes, userRes] = await Promise.all([
          fetch("/api/plans"),
          user ? fetch("/api/user/subscription", {
            headers: {
              "x-user-id": user.id,
            },
          }) : Promise.resolve(null),
        ]);

        const [plansData, userData] = await Promise.all([
          plansRes.json() as Promise<PlansResponse>,
          userRes ? userRes.json() as Promise<UserSubscriptionInfo> : null,
        ]);

        console.log('DEBUG - usePricing - Dados carregados:', {
          plansCount: plansData.plans?.length,
          userData: userData ? {
            subscription: userData.subscription ? {
              planId: userData.subscription.planId,
              status: userData.subscription.status
            } : null,
            currentPlan: userData.currentPlan ? {
              name: userData.currentPlan.name,
              planId: userData.currentPlan.planId
            } : null
          } : null
        });

        if (plansData.plans) {
          const activePlans = plansData.plans.filter((plan: SubscriptionPlan) => plan.active);
          // Ordena os planos por preço
          const sortedPlans = activePlans.sort((a: SubscriptionPlan, b: SubscriptionPlan) => {
            const priceA = isYearly 
              ? parseFloat(a.yearlyPrice || "0") / 12 // Converte para preço mensal para comparação
              : parseFloat(a.monthlyPrice || "0");
            const priceB = isYearly 
              ? parseFloat(b.yearlyPrice || "0") / 12 // Converte para preço mensal para comparação
              : parseFloat(b.monthlyPrice || "0");
            return priceA - priceB;
          });
          setPlans(sortedPlans);
        }

        if (userData) {
          console.log('DEBUG - usePricing - Atualizando userInfo:', userData);
          setUserInfo(userData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar informações dos planos");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Efeito separado para ordenar os planos quando isYearly muda
  useEffect(() => {
    if (plans.length > 0) {
      const sortedPlans = [...plans].sort((a: SubscriptionPlan, b: SubscriptionPlan) => {
        const priceA = isYearly 
          ? parseFloat(a.yearlyPrice || "0") / 12
          : parseFloat(a.monthlyPrice || "0");
        const priceB = isYearly 
          ? parseFloat(b.yearlyPrice || "0") / 12
          : parseFloat(b.monthlyPrice || "0");
        return priceA - priceB;
      });
      setPlans(sortedPlans);
    }
  }, [isYearly]);

  const handleCheckout = async (priceId: string | null, isYearly: boolean) => {
    console.log('DEBUG - handleCheckout - Iniciando:', {
      priceId,
      isYearly,
      userId: user?.id,
      email: user?.emailAddresses?.[0]?.emailAddress,
      userInfo: userInfo ? {
        currentPlan: userInfo.currentPlan ? {
          name: userInfo.currentPlan.name,
          planId: userInfo.currentPlan.planId
        } : null,
        subscription: userInfo.subscription ? {
          status: userInfo.subscription.status,
          planId: userInfo.subscription.planId
        } : null
      } : null
    });

    if (!user) {
      console.log('DEBUG - handleCheckout - Usuário não autenticado, redirecionando para login');
      router.push("/sign-in");
      return;
    }

    if (!priceId) {
      console.error("DEBUG - handleCheckout - Erro: priceId não fornecido");
      toast.error("Erro: Plano inválido");
      return;
    }

    try {
      // Validações adicionais
      if (!user.emailAddresses?.[0]?.emailAddress) {
        throw new Error("Email do usuário não encontrado");
      }

      const response = await axios.post("/api/payments/create-checkout-session", {
        priceId,
        userId: user.id,
        email: user.emailAddresses[0].emailAddress,
        subscription: true,
      });

      console.log('DEBUG - handleCheckout - Resposta do servidor:', {
        sessionId: response.data.sessionId,
        status: response.status,
        headers: response.headers
      });

      if (!response.data.sessionId) {
        throw new Error("No session ID returned from server");
      }

      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);
      if (!stripe) {
        throw new Error("Stripe not loaded");
      }

      console.log('DEBUG - handleCheckout - Redirecionando para checkout:', {
        sessionId: response.data.sessionId,
        timestamp: new Date().toISOString()
      });

      await stripe.redirectToCheckout({
        sessionId: response.data.sessionId
      });
    } catch (error: any) {
      console.error("DEBUG - handleCheckout - Erro detalhado:", {
        message: error.message,
        response: {
          data: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        },
        stack: error.stack,
        timestamp: new Date().toISOString()
      });

      // Tratamento específico de erros
      if (error.response?.status === 400) {
        toast.error("Dados inválidos. Por favor, tente novamente.");
      } else if (error.response?.status === 401) {
        toast.error("Sessão expirada. Por favor, faça login novamente.");
        router.push("/sign-in");
      } else if (error.response?.status === 500) {
        toast.error("Erro no servidor. Por favor, tente novamente mais tarde.");
      } else {
        toast.error(`Erro ao processar checkout: ${error.message}`);
      }
    }
  };

  return {
    isYearly,
    setIsYearly,
    plans,
    userInfo,
    handleCheckout,
    user,
    isLoading
  };
} 