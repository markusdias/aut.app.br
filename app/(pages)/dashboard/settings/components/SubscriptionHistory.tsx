import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

type SubscriptionHistoryProps = {
  userId: string;
};

type HistoryItem = {
  oldPlanName: string;
  newPlanName: string;
  changedAt: string;
  isUpgrade: boolean;
};

export function SubscriptionHistory({ userId }: SubscriptionHistoryProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { toast } = useToast();

  const loadHistory = async () => {
    if (hasLoaded) {
      setShowHistory(!showHistory);
      return;
    }

    try {
      setIsLoading(true);
      setShowHistory(true);
      const response = await axios.get("/api/user/subscription/history", {
        headers: {
          "x-user-id": userId
        }
      });
      setHistory(response.data.history || []);
      setHasLoaded(true);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar o histórico de mudanças",
        variant: "destructive",
      });
      setShowHistory(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Separator />
      <div className="space-y-4">
        <Button
          variant="ghost"
          className="w-full justify-between"
          onClick={loadHistory}
        >
          <span>Histórico de mudanças de plano</span>
          {showHistory ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {showHistory && (
          <div className="space-y-4">
            {isLoading ? (
              // Skeleton loader
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2 animate-pulse">
                    <div className="w-4 h-4 bg-muted rounded" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-3/4 mb-1" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </>
            ) : history.length > 0 ? (
              history.map((change, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {change.isUpgrade ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        {change.oldPlanName} → {change.newPlanName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(change.changedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                Nenhuma mudança de plano encontrada
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
} 