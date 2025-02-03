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
import { PricingCard } from "./pricing-card";
import { usePricing } from "@/utils/hooks/usePricing";

type PricingSwitchProps = {
  onSwitch: (value: string) => void;
};

type UserSubscriptionInfo = {
  user: any;
  subscription: any;
  currentPlan: SubscriptionPlan | null;
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

export const PricingSwitch = ({ onSwitch }: PricingSwitchProps) => (
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

export default function Pricing() {
  const {
    isYearly,
    setIsYearly,
    plans,
    userInfo,
    handleCheckout,
    user,
    isLoading
  } = usePricing();

  console.log('DEBUG - Pricing Component:', {
    isLoading,
    isYearly,
    userInfo: userInfo ? {
      currentPlan: userInfo.currentPlan ? {
        name: userInfo.currentPlan.name,
        planId: userInfo.currentPlan.planId,
        monthlyPriceId: userInfo.currentPlan.monthlyPriceId,
        yearlyPriceId: userInfo.currentPlan.yearlyPriceId
      } : null,
      subscription: userInfo.subscription ? {
        planId: userInfo.subscription.planId,
        status: userInfo.subscription.status
      } : null
    } : null,
    plans: plans.map(plan => ({
      name: plan.name,
      planId: plan.planId,
      monthlyPriceId: plan.monthlyPriceId,
      yearlyPriceId: plan.yearlyPriceId
    }))
  });

  // Se estiver carregando, mostra um indicador de carregamento
  if (isLoading) {
    return (
      <div className="container py-20">
        <PricingHeader
          title="Simple, transparent pricing"
          subtitle="Choose the plan that's right for you"
        />
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Se não houver planos ativos, não renderiza o componente
  if (!plans || plans.length === 0) {
    return null;
  }

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
          {plans.map((plan) => {
            const currentPriceId = isYearly ? plan.yearlyPriceId : plan.monthlyPriceId;
            const isCurrentPlan = userInfo?.currentPlan?.planId === plan.planId;

            console.log('DEBUG - Pricing - Comparando planos:', {
              planName: plan.name,
              planId: plan.planId,
              currentPriceId,
              userCurrentPlanId: userInfo?.currentPlan?.planId,
              isCurrentPlan
            });

            return (
              <PricingCard
                key={plan.id}
                user={user}
                handleCheckout={handleCheckout}
                plan={plan}
                isYearly={isYearly}
                isCurrentPlan={isCurrentPlan}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
