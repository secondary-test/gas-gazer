import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGasStore } from "@/store/gasStore";
import { Calculator, DollarSign, Fuel } from "lucide-react";

const chainColors = {
  ethereum: "bg-crypto-blue",
  polygon: "bg-crypto-purple",
  arbitrum: "bg-crypto-orange"
};

export function TransactionSimulator() {
  const { 
    simulation, 
    updateSimulation, 
    calculateSimulation, 
    chains,
    usdPrice 
  } = useGasStore();

  const handleAmountChange = (value: string) => {
    updateSimulation(value, simulation.gasLimit);
    calculateSimulation();
  };

  const handleGasLimitChange = (value: string) => {
    const gasLimit = parseInt(value) || 21000;
    updateSimulation(simulation.amount, gasLimit);
    calculateSimulation();
  };

  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-crypto-purple" />
          Transaction Cost Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Transaction Amount (ETH)</Label>
            <Input
              id="amount"
              type="number"
              step="0.001"
              value={simulation.amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.1"
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gasLimit">Gas Limit</Label>
            <Input
              id="gasLimit"
              type="number"
              value={simulation.gasLimit}
              onChange={(e) => handleGasLimitChange(e.target.value)}
              placeholder="21000"
              className="bg-secondary border-border"
            />
          </div>
        </div>

        {usdPrice > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>ETH/USD: ${usdPrice.toFixed(2)}</span>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Cross-Chain Cost Comparison</h4>
          <div className="grid gap-3">
            {simulation.results.map((result) => {
              const chain = chains[result.chain as keyof typeof chains];
              return (
                <div
                  key={result.chain}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Badge 
                      className={`${chainColors[result.chain as keyof typeof chainColors]} text-white`}
                    >
                      {chain.name}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Fuel className="h-3 w-3" />
                      Gas: ${result.gasCostUsd.toFixed(4)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      ${result.totalCostUsd.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total Cost
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Button 
          onClick={calculateSimulation}
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          Recalculate Costs
        </Button>
      </CardContent>
    </Card>
  );
}