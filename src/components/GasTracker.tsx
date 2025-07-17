import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGasStore } from "@/store/gasStore";
import { Activity, Zap, TrendingUp } from "lucide-react";

const chainIcons = {
  ethereum: "⟠",
  polygon: "⬟",
  arbitrum: "⬢"
};

export function GasTracker() {
  const { chains, usdPrice } = useGasStore();

  const formatGwei = (value: number) => `${value.toFixed(1)} gwei`;
  const formatUsd = (value: number) => `$${value.toFixed(2)}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.entries(chains).map(([key, chain]) => (
        <Card key={key} className="bg-gradient-card border-border shadow-card hover:shadow-elevated transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{chainIcons[key as keyof typeof chainIcons]}</span>
                <span>{chain.name}</span>
              </div>
              <Badge 
                variant={chain.isConnected ? "default" : "secondary"}
                className={chain.isConnected ? "bg-crypto-green" : "bg-muted"}
              >
                {chain.isConnected ? "Live" : "Offline"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Zap className="h-3 w-3" />
                  Base Fee
                </div>
                <div className="text-lg font-semibold">
                  {formatGwei(chain.baseFee)}
                </div>
                {usdPrice > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {formatUsd((chain.baseFee / 1e9) * 21000 * usdPrice)}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  Priority Fee
                </div>
                <div className="text-lg font-semibold">
                  {formatGwei(chain.priorityFee)}
                </div>
                {usdPrice > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {formatUsd((chain.priorityFee / 1e9) * 21000 * usdPrice)}
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-3 bg-secondary/50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4 text-crypto-purple" />
                  <span>Total Gas Cost</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {formatGwei(chain.baseFee + chain.priorityFee)}
                  </div>
                  {usdPrice > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {formatUsd(((chain.baseFee + chain.priorityFee) / 1e9) * 21000 * usdPrice)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {chain.lastUpdate > 0 && (
              <div className="text-xs text-muted-foreground">
                Last updated: {new Date(chain.lastUpdate).toLocaleTimeString()}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}