"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, DollarSign, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { SubscriptionPlan } from "@/utils/data/plans/getSubscriptionPlans";

type PricingSwitchProps = {
  onSwitch: (value: string) => void;
};

type PricingCardProps = {
  user: any;
  handleCheckout: any;
  plan: SubscriptionPlan;
  isYearly?: boolean;
};

type Benefit = {
  name: string;
  included: boolean;
  order: number;
};

const PricingHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div className="text-center mb-10">
    {/* Pill badge */}
    <div className="mx-auto w-fit rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/30 px-4 py-1 mb-6">
      <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-200">
        <DollarSign className="h-4 w-4" />
        <span>Pricing</span>
      </div>
    </div>

    <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-300 dark:to-white pb-2">
      {title}
    </h2>
    <p className="text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
      {subtitle}
    </p>
  </div>
);

const PricingSwitch = ({ onSwitch }: PricingSwitchProps) => (
  <div className="flex justify-center items-center gap-3">
    <Tabs defaultValue="0" className="w-[400px]" onValueChange={onSwitch}>
      <TabsList className="w-full">
        <TabsTrigger value="0" className="w-full">
          Monthly
        </TabsTrigger>
        <TabsTrigger value="1" className="w-full">
          Yearly
        </TabsTrigger>
      </TabsList>
    </Tabs>
  </div>
);

const PricingCard = ({
  user,
  handleCheckout,
  plan,
  isYearly,
}: PricingCardProps) => {
  const router = useRouter();
  
  // Determina se o plano tem a opção selecionada
  const hasSelectedPrice = isYearly ? plan.hasYearlyPrice : plan.hasMonthlyPrice;
  const price = isYearly 
    ? parseFloat(plan.yearlyPrice || "0") 
    : parseFloat(plan.monthlyPrice || "0");
  const priceId = isYearly ? plan.yearlyPriceId : plan.monthlyPriceId;

  // Parse dos benefícios dos metadados baseado no tipo de preço
  const currentMetadata = isYearly ? plan.yearlyMetadata : plan.monthlyMetadata;
  const benefits: Benefit[] = currentMetadata?.benefits 
    ? JSON.parse(currentMetadata.benefits)
    : [];
  const userDescription = currentMetadata?.userDescription || plan.metadata?.userDescription;

  // Se o plano não tem a opção selecionada, não renderiza
  if (!hasSelectedPrice) {
    return null;
  }

  return (
    <Card
      className={cn("w-full max-w-sm flex flex-col justify-between px-2 py-1", {
        "relative border-2 border-blue-500 dark:border-blue-400": plan.name?.toLowerCase().includes("pro"),
        "shadow-2xl bg-gradient-to-b from-gray-900 to-gray-800 text-white": plan.name?.toLowerCase().includes("enterprise"),
      })}
    >
      {plan.name?.toLowerCase().includes("pro") && (
        <div className="absolute -top-3 left-0 right-0 mx-auto w-fit rounded-full bg-blue-500 dark:bg-blue-400 px-3 py-1">
          <p className="text-sm font-medium text-white">Most Popular</p>
        </div>
      )}

      <div>
        <CardHeader className="space-y-2 pb-4">
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          <CardDescription
            className={cn("", {
              "text-gray-300": plan.name?.toLowerCase().includes("enterprise"),
            })}
          >
            {userDescription || plan.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-4">
          <div className="flex items-baseline gap-1">
            <span
              className={cn("text-4xl font-bold", {
                "text-white": plan.name?.toLowerCase().includes("enterprise"),
              })}
            >
              ${price.toFixed(2)}
            </span>
            <span
              className={cn("text-muted-foreground", {
                "text-gray-300": plan.name?.toLowerCase().includes("enterprise"),
              })}
            >
              /mo
            </span>
          </div>

          <div className="mt-6 space-y-2">
            {/* Billing type */}
            <div className="flex gap-2">
              <CheckCircle2
                className={cn("h-5 w-5 text-blue-500", {
                  "text-blue-400": plan.name?.toLowerCase().includes("enterprise"),
                })}
              />
              <span
                className={cn("text-sm text-muted-foreground", {
                  "text-gray-300": plan.name?.toLowerCase().includes("enterprise"),
                })}
              >
                {isYearly ? "Yearly" : "Monthly"} billing
              </span>
            </div>

            {/* Benefits list */}
            {benefits.sort((a, b) => a.order - b.order).map((benefit, index) => (
              <div key={index} className="flex gap-2">
                {benefit.included ? (
                  <CheckCircle2
                    className={cn("h-5 w-5 text-blue-500", {
                      "text-blue-400": plan.name?.toLowerCase().includes("enterprise"),
                    })}
                  />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-300" />
                )}
                <span
                  className={cn("text-sm text-muted-foreground", {
                    "text-gray-300": plan.name?.toLowerCase().includes("enterprise"),
                    "text-gray-400": !benefit.included,
                  })}
                >
                  {benefit.name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </div>

      <CardFooter>
        <Button
          className={cn("w-full", {
            "bg-blue-500 hover:bg-blue-600": plan.name?.toLowerCase().includes("pro"),
            "bg-gradient-to-r from-blue-500 to-blue-600": plan.name?.toLowerCase().includes("enterprise"),
          })}
          onClick={() => handleCheckout(priceId, isYearly)}
        >
          Get Started
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Carrega os planos do banco de dados
    const loadPlans = async () => {
      try {
        const response = await fetch("/api/plans");
        const data = await response.json();
        if (data.plans) {
          const activePlans = data.plans.filter((plan: SubscriptionPlan) => plan.active);
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
      } catch (error) {
        console.error("Erro ao carregar planos:", error);
        toast.error("Erro ao carregar planos de assinatura");
      }
    };

    loadPlans();
  }, [isYearly]); // Adiciona isYearly como dependência para reordenar quando mudar

  // Se não houver planos ativos, não renderiza o componente
  if (!plans || plans.length === 0) {
    return null;
  }

  const handleCheckout = async (priceId: string | null, isYearly: boolean) => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    try {
      const response = await axios.post("/api/payments/create-checkout-session", {
        priceId,
        userId: user.id,
        email: user.emailAddresses[0].emailAddress,
        subscription: true,
      });

      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);
      const { error } = await stripe!.redirectToCheckout({
        sessionId: response.data.sessionId,
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("Error during checkout");
    }
  };

  return (
    <div className="container py-20">
      <PricingHeader
        title="Simple, transparent pricing"
        subtitle="Choose the plan that's right for you"
      />

      {/* Sempre mostra o switch se houver pelo menos um plano com opção anual */}
      {plans.some(plan => plan.hasYearlyPrice) && (
        <div className="mb-10">
          <PricingSwitch onSwitch={(value) => setIsYearly(value === "1")} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8 place-items-center">
        <div className={cn(
          "col-span-full grid gap-6 lg:gap-8",
          {
            "lg:grid-cols-1 max-w-sm": plans.length === 1,
            "lg:grid-cols-2 max-w-4xl": plans.length === 2,
            "lg:grid-cols-3 w-full": plans.length >= 3,
          }
        )}>
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              user={user}
              handleCheckout={handleCheckout}
              plan={plan}
              isYearly={isYearly}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
