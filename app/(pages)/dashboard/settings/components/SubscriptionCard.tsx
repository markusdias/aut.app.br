"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronDown, 
  ChevronUp, 
  CreditCard, 
  AlertTriangle 
} from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/utils/format";
import { SubscriptionPlan } from "@/utils/data/plans/getSubscriptionPlans";
import { Subscription } from "@/utils/hooks/usePricing";
import { UpgradePlanModal } from "@/components/upgrade-plan-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { SubscriptionHistory } from "./SubscriptionHistory";
import { AxiosError } from "axios";

type SubscriptionCardProps = {
  currentPlan: SubscriptionPlan | null;
  subscription: Subscription | null;
  isLoading?: boolean;
  error?: string;
};

export default function SubscriptionCard({ 
  currentPlan, 
  subscription, 
  isLoading = false,
  error
}: SubscriptionCardProps) {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRevertModalOpen, setIsRevertModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonDetail, setCancelReasonDetail] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const { toast } = useToast();

  const handleCancelSubscription = async () => {
    try {
      setIsCancelling(true);
      const response = await axios.post(
        "/api/user/subscription/cancel",
        {
          cancellationReason: cancelReason + (cancelReasonDetail ? ": " + cancelReasonDetail : "")
        },
        {
          headers: {
            "x-user-id": subscription?.userId || ""
          }
        }
      );

      toast({
        title: "Cancelamento agendado",
        description: `Sua assinatura será cancelada automaticamente em ${new Date(response.data.effectiveCancellationDate).toLocaleDateString('pt-BR')}`,
      });

      setIsCancelModalOpen(false);
      window.location.reload(); // Recarrega para atualizar o status
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      toast({
        title: "Erro ao cancelar",
        description: axiosError.response?.data?.error || "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRevertCancellation = async () => {
    try {
      const response = await axios.post(
        "/api/user/subscription/revert-cancel",
        {},
        {
          headers: {
            "x-user-id": subscription?.userId || ""
          }
        }
      );

      toast({
        title: "Cancelamento revertido",
        description: "Sua assinatura continuará ativa normalmente.",
      });

      window.location.reload();
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      toast({
        title: "Erro ao reverter cancelamento",
        description: axiosError.response?.data?.error || "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plano</CardTitle>
          <CardDescription>Carregando informações...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-8 bg-muted animate-pulse rounded" />
            <Separator />
            <div className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plano</CardTitle>
          <CardDescription className="text-destructive">Erro ao carregar informações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {error}
          </div>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentPlan || !subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plano</CardTitle>
          <CardDescription>Você não possui um plano ativo</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full">
            Ver planos disponíveis
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isMonthly = currentPlan.interval === "month";
  const amount = isMonthly ? currentPlan.monthlyPrice : currentPlan.yearlyPrice;
  const nextBillingDate = subscription.currentPeriodEnd 
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')
    : 'Não disponível';

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Plano</CardTitle>
          <CardDescription>Informações do seu plano atual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{currentPlan.name}</h3>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(amount || "0")} / {isMonthly ? "mês" : "ano"}
              </p>
            </div>
            {!subscription.cancelAtPeriodEnd && (
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setIsUpgradeModalOpen(true)}>
                  Mudar plano
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setIsCancelModalOpen(true)}
                >
                  Cancelar plano
                </Button>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <div className="flex items-center gap-2">
                {subscription.cancelAtPeriodEnd ? (
                  <span className="text-yellow-500 font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Cancelamento Agendado
                  </span>
                ) : (
                  <span className="font-medium capitalize">{subscription.status}</span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {subscription.cancelAtPeriodEnd ? "Data de Encerramento" : "Próxima cobrança"}
              </span>
              <div className="text-right">
                <span className="font-medium">{nextBillingDate}</span>
                {subscription.cancelAtPeriodEnd && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Sua assinatura será encerrada nesta data, sem cobranças adicionais
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Forma de pagamento</span>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="font-medium">•••• 4242</span>
              </div>
            </div>
          </div>

          {subscription.cancelAtPeriodEnd && (
            <div className="flex justify-end">
              <Button 
                variant="outline"
                className="border-blue-500 text-blue-500 transition-all duration-200 hover:bg-blue-500 hover:text-white hover:border-blue-600 active:bg-blue-600"
                onClick={() => setIsRevertModalOpen(true)}
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Manter assinatura
              </Button>
            </div>
          )}

          <SubscriptionHistory userId={subscription.userId} />
        </CardContent>
      </Card>

      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Assinatura</DialogTitle>
            <DialogDescription>
              Sua assinatura continuará ativa até o fim do período atual. Após isso, será cancelada automaticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-10 w-10 text-yellow-500" />
              <div className="text-sm">
                <p className="font-medium">Importante:</p>
                <p className="text-muted-foreground">
                  Você manterá acesso a todos os recursos até o fim do período atual em {new Date(subscription?.currentPeriodEnd || "").toLocaleDateString('pt-BR')}.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Motivo do cancelamento</Label>
              <Select value={cancelReason} onValueChange={setCancelReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Preço muito alto</SelectItem>
                  <SelectItem value="features">Faltam recursos necessários</SelectItem>
                  <SelectItem value="unused">Não estou usando o suficiente</SelectItem>
                  <SelectItem value="competitor">Mudando para outro serviço</SelectItem>
                  <SelectItem value="temporary">Pausa temporária</SelectItem>
                  <SelectItem value="other">Outro motivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Detalhes adicionais (opcional)</Label>
              <Textarea
                placeholder="Conte-nos mais sobre sua decisão..."
                value={cancelReasonDetail}
                onChange={(e) => setCancelReasonDetail(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>
              Manter assinatura
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelSubscription}
              disabled={!cancelReason || isCancelling}
            >
              {isCancelling ? "Cancelando..." : "Confirmar cancelamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpgradePlanModal 
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />

      <Dialog open={isRevertModalOpen} onOpenChange={setIsRevertModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manter Assinatura</DialogTitle>
            <DialogDescription>
              Você está prestes a manter sua assinatura ativa. O cancelamento agendado será revertido.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-50 rounded-full">
                <ArrowUpRight className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">Benefícios ao manter sua assinatura:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Acesso contínuo a todos os recursos</li>
                  <li>• Sem interrupção do serviço</li>
                  <li>• Mantém configurações e preferências</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRevertModalOpen(false)}>
              Voltar
            </Button>
            <Button 
              onClick={() => {
                handleRevertCancellation();
                setIsRevertModalOpen(false);
              }}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Confirmar e Manter Assinatura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 