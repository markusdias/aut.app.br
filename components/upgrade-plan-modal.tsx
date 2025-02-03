"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PricingCard } from "./homepage/pricing-card";
import { PricingSwitch } from "./homepage/pricing";
import { usePricing } from "@/utils/hooks/usePricing";
import { SubscriptionPlan } from "@/utils/data/plans/getSubscriptionPlans";

type UpgradePlanModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function UpgradePlanModal({ isOpen, onClose }: UpgradePlanModalProps) {
  const {
    isYearly,
    setIsYearly,
    plans,
    userInfo,
    handleCheckout,
    user
  } = usePricing();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {userInfo?.currentPlan
              ? "Alterar Plano de Assinatura"
              : "Escolha um Plano"}
          </DialogTitle>
        </DialogHeader>

        {/* Adiciona o switch de período se houver planos anuais */}
        {plans.some((plan) => plan.hasYearlyPrice) && (
          <div className="mb-6">
            <PricingSwitch onSwitch={(value) => setIsYearly(value === "1")} />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8 place-items-center py-6">
          <div
            className={`col-span-full grid gap-6 lg:gap-8 ${
              plans.length === 1
                ? "lg:grid-cols-1 max-w-sm"
                : plans.length === 2
                ? "lg:grid-cols-2 max-w-4xl"
                : "lg:grid-cols-3 w-full"
            }`}
          >
            {plans.map((plan: SubscriptionPlan) => {
              const currentPriceId = isYearly ? plan.yearlyPriceId : plan.monthlyPriceId;
              return (
                <div key={plan.id}>
                  <PricingCard
                    user={user}
                    handleCheckout={handleCheckout}
                    plan={plan}
                    isYearly={isYearly}
                    isCurrentPlan={userInfo?.currentPlan?.planId === currentPriceId}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 