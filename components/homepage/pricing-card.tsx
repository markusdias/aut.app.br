import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SubscriptionPlan } from "@/utils/data/plans/getSubscriptionPlans";

type PricingCardProps = {
  user: any;
  handleCheckout: any;
  plan: SubscriptionPlan;
  isYearly?: boolean;
  isCurrentPlan?: boolean;
};

type Benefit = {
  name: string;
  included: boolean;
  order: number;
};

export function PricingCard({
  user,
  handleCheckout,
  plan,
  isYearly,
  isCurrentPlan,
}: PricingCardProps) {
  // Determina se o plano tem a opção selecionada
  const hasSelectedPrice = isYearly ? plan.hasYearlyPrice : plan.hasMonthlyPrice;
  const price = isYearly
    ? parseFloat(plan.yearlyPrice || "0")
    : parseFloat(plan.monthlyPrice || "0");
  const priceId = isYearly ? plan.yearlyPriceId : plan.monthlyPriceId;

  console.log('DEBUG - PricingCard:', {
    planName: plan.name,
    planId: plan.planId,
    priceId,
    isYearly,
    isCurrentPlan,
    monthlyPriceId: plan.monthlyPriceId,
    yearlyPriceId: plan.yearlyPriceId
  });

  // Parse dos benefícios dos metadados baseado no tipo de preço
  const currentMetadata = isYearly ? plan.yearlyMetadata : plan.monthlyMetadata;
  const benefits: Benefit[] = currentMetadata?.benefits
    ? JSON.parse(currentMetadata.benefits)
    : [];
  const userDescription =
    currentMetadata?.userDescription || plan.metadata?.userDescription;

  // Determina o texto do botão baseado no contexto
  const getButtonText = () => {
    if (isCurrentPlan) return "Plano Atual";
    if (!user) return "Começar Agora";
    return "Migrar para este plano";
  };

  // Se o plano não tem a opção selecionada, não renderiza
  if (!hasSelectedPrice) {
    return null;
  }

  return (
    <Card
      className={cn("w-full max-w-sm flex flex-col justify-between px-2 py-1", {
        "relative border-2 border-blue-500 dark:border-blue-400":
          plan.name?.toLowerCase().includes("pro"),
        "shadow-2xl bg-gradient-to-b from-gray-900 to-gray-800 text-white":
          plan.name?.toLowerCase().includes("enterprise"),
      })}
    >
      {plan.name?.toLowerCase().includes("pro") && !isCurrentPlan && (
        <div className="absolute -top-3 left-0 right-0 mx-auto w-fit rounded-full bg-blue-500 dark:bg-blue-400 px-3 py-1">
          <p className="text-sm font-medium text-white">Most Popular</p>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 left-0 right-0 mx-auto w-fit rounded-full bg-green-500 px-3 py-1">
          <p className="text-sm font-medium text-white">Plano Atual</p>
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
                      "text-blue-400": plan.name?.toLowerCase().includes(
                        "enterprise"
                      ),
                    })}
                  />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-300" />
                )}
                <span
                  className={cn("text-sm text-muted-foreground", {
                    "text-gray-300": plan.name?.toLowerCase().includes(
                      "enterprise"
                    ),
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
            "bg-blue-500 hover:bg-blue-600": plan.name?.toLowerCase().includes(
              "pro"
            ),
            "bg-gradient-to-r from-blue-500 to-blue-600":
              plan.name?.toLowerCase().includes("enterprise"),
          })}
          onClick={() => handleCheckout(priceId, isYearly)}
          disabled={isCurrentPlan}
        >
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
} 