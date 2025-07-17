import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGasStore } from "@/store/gasStore";
import { BarChart3, TrendingUp } from "lucide-react";
import { useEffect, useRef } from "react";
import { createChart, ColorType } from "lightweight-charts";

export function GasChart() {
  const { chains, mode } = useGasStore();
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const seriesRef = useRef<{
    ethereum: any;
    polygon: any;
    arbitrum: any;
  }>({ ethereum: null, polygon: null, arbitrum: null });

  useEffect(() => {
    if (!chartRef.current) return;

    // Create chart
    const chart = createChart(chartRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'hsl(var(--foreground))',
      },
      width: chartRef.current.clientWidth,
      height: 320,
      grid: {
        vertLines: { color: 'hsl(var(--border))' },
        horzLines: { color: 'hsl(var(--border))' },
      },
      rightPriceScale: {
        borderColor: 'hsl(var(--border))',
      },
      timeScale: {
        borderColor: 'hsl(var(--border))',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartInstanceRef.current = chart;

    // Create series for each chain
    const ethereumSeries = (chart as any).addLineSeries({
      color: '#3B82F6',
      lineWidth: 2,
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
    });

    const polygonSeries = (chart as any).addLineSeries({
      color: '#8B5CF6',
      lineWidth: 2,
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
    });

    const arbitrumSeries = (chart as any).addLineSeries({
      color: '#F97316',
      lineWidth: 2,
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
    });

    seriesRef.current = {
      ethereum: ethereumSeries,
      polygon: polygonSeries,
      arbitrum: arbitrumSeries,
    };

    // Handle resize
    const handleResize = () => {
      if (chartRef.current && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({ width: chartRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update chart data when chains data changes
  useEffect(() => {
    if (!seriesRef.current.ethereum || !seriesRef.current.polygon || !seriesRef.current.arbitrum) return;

    const now = Math.floor(Date.now() / 1000); // Convert to seconds for lightweight-charts

    // Generate sample data for demonstration
    const ethereumData = [
      { time: now - 900, value: chains.ethereum.baseFee + chains.ethereum.priorityFee || 15 },
      { time: now - 600, value: (chains.ethereum.baseFee + chains.ethereum.priorityFee) * 0.9 || 13.5 },
      { time: now - 300, value: (chains.ethereum.baseFee + chains.ethereum.priorityFee) * 1.1 || 16.5 },
      { time: now, value: chains.ethereum.baseFee + chains.ethereum.priorityFee || 13.7 },
    ];

    const polygonData = [
      { time: now - 900, value: chains.polygon.baseFee + chains.polygon.priorityFee || 75 },
      { time: now - 600, value: (chains.polygon.baseFee + chains.polygon.priorityFee) * 0.8 || 58 },
      { time: now - 300, value: (chains.polygon.baseFee + chains.polygon.priorityFee) * 1.2 || 87 },
      { time: now, value: chains.polygon.baseFee + chains.polygon.priorityFee || 72.4 },
    ];

    const arbitrumData = [
      { time: now - 900, value: chains.arbitrum.baseFee + chains.arbitrum.priorityFee || 0.05 },
      { time: now - 600, value: (chains.arbitrum.baseFee + chains.arbitrum.priorityFee) * 0.7 || 0.021 },
      { time: now - 300, value: (chains.arbitrum.baseFee + chains.arbitrum.priorityFee) * 1.3 || 0.039 },
      { time: now, value: chains.arbitrum.baseFee + chains.arbitrum.priorityFee || 0.03 },
    ];

    seriesRef.current.ethereum.setData(ethereumData);
    seriesRef.current.polygon.setData(polygonData);
    seriesRef.current.arbitrum.setData(arbitrumData);
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
          className="h-80 rounded-lg overflow-hidden"
        />
        
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