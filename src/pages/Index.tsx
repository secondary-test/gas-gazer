import { useEffect } from "react";
import { GasTracker } from "@/components/GasTracker";
import { TransactionSimulator } from "@/components/TransactionSimulator";
import { GasChart } from "@/components/GasChart";
import { ModeToggle } from "@/components/ModeToggle";
import { useGasStore } from "@/store/gasStore";
import { Activity, Zap } from "lucide-react";

const Index = () => {
  const { setUsdPrice, updateChainData, calculateSimulation } = useGasStore();

  // Initialize with mock data for demo
  useEffect(() => {
    // Mock USD price
    setUsdPrice(3247.82);

    // Mock gas data
    updateChainData('ethereum', {
      baseFee: 12.5,
      priorityFee: 1.2,
      isConnected: true
    });

    updateChainData('polygon', {
      baseFee: 42.3,
      priorityFee: 30.1,
      isConnected: true
    });

    updateChainData('arbitrum', {
      baseFee: 0.02,
      priorityFee: 0.01,
      isConnected: true
    });

    // Calculate initial simulation
    calculateSimulation();
  }, [setUsdPrice, updateChainData, calculateSimulation]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Zap className="h-8 w-8 text-crypto-purple" />
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Gas Gazer
                </h1>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>Cross-Chain Gas Tracker</span>
              </div>
            </div>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Real-Time{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Cross-Chain
              </span>
              {" "}Gas Tracking
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Monitor gas prices across Ethereum, Polygon, and Arbitrum. 
              Simulate transaction costs and optimize your cross-chain strategy.
            </p>
          </div>

          {/* Gas Tracker Cards */}
          <section>
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Activity className="h-6 w-6 text-crypto-purple" />
              Live Gas Prices
            </h3>
            <GasTracker />
          </section>

          {/* Chart and Simulator Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <GasChart />
            </div>
            <div>
              <TransactionSimulator />
            </div>
          </div>

          {/* Technical Info */}
          <section className="bg-secondary/30 rounded-lg p-6 border border-border">
            <h4 className="text-lg font-semibold mb-4">Technical Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="space-y-1">
                <div className="font-medium">Real-Time Data</div>
                <div className="text-muted-foreground">WebSocket connections to native RPCs</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium">USD Pricing</div>
                <div className="text-muted-foreground">Uniswap V3 ETH/USDC pool events</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium">State Management</div>
                <div className="text-muted-foreground">Zustand with live/simulation modes</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium">Visualization</div>
                <div className="text-muted-foreground">Lightweight Charts candlesticks</div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
