import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGasStore } from "@/store/gasStore";
import { BarChart3, TrendingUp, Activity } from "lucide-react";
import { useEffect, useRef } from "react";

export function GasChart() {
  const { chains, mode } = useGasStore();
  const chartRef = useRef<HTMLDivElement>(null);

  // Placeholder for lightweight-charts integration
  useEffect(() => {
    // Chart initialization will go here
    console.log("Chart data updated:", chains);
  }, [chains]);

  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-crypto-purple" />
            Gas Price Volatility
          </div>
          <Badge variant={mode === 'live' ? 'default' : 'secondary'}>
            {mode === 'live' ? 'Live Data' : 'Simulation'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={chartRef}
          className="h-80 bg-secondary/30 rounded-lg border-2 border-dashed border-border flex items-center justify-center"
        >
          <div className="text-center space-y-2">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto" />
            <div className="text-lg font-medium text-muted-foreground">
              Candlestick Chart
            </div>
            <div className="text-sm text-muted-foreground">
              Real-time gas price data visualization
            </div>
            <div className="text-xs text-muted-foreground">
              15-minute intervals • Lightweight Charts
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-crypto-blue rounded-full"></div>
              <span>Ethereum</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-crypto-purple rounded-full"></div>
              <span>Polygon</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-crypto-orange rounded-full"></div>
              <span>Arbitrum</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Auto-refresh: 6s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}