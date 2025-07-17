import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGasStore } from "@/store/gasStore";
import { BarChart3, TrendingUp } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import {
  CandlestickController,
  CandlestickElement,
} from "chartjs-chart-financial";
import { useMemo, useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  CandlestickController,
  CandlestickElement
);

function aggregateToOHLC(history, intervalSec = 60) {
  if (!Array.isArray(history) || history.length === 0) return [];
  const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);
  const candles = [];
  let candle = null;
  let lastInterval = null;
  for (const pt of sorted) {
    const interval = Math.floor(pt.timestamp / intervalSec) * intervalSec;
    if (interval !== lastInterval) {
      if (candle) candles.push(candle);
      candle = {
        x: new Date(interval * 1000),
        o: pt.baseFee + pt.priorityFee,
        h: pt.baseFee + pt.priorityFee,
        l: pt.baseFee + pt.priorityFee,
        c: pt.baseFee + pt.priorityFee,
      };
      lastInterval = interval;
    } else {
      const value = pt.baseFee + pt.priorityFee;
      candle.h = Math.max(candle.h, value);
      candle.l = Math.min(candle.l, value);
      candle.c = value;
    }
  }
  if (candle) candles.push(candle);
  return candles;
}

const CHAIN_OPTIONS = [
  { key: "ethereum", label: "Ethereum" },
  { key: "polygon", label: "Polygon" },
  { key: "arbitrum", label: "Arbitrum" },
];

export function GasChart() {
  const { chains, mode } = useGasStore();
  const [selectedChain, setSelectedChain] = useState("ethereum");
  const chain = chains[selectedChain];
  const ohlc = useMemo(() => aggregateToOHLC(chain.history), [chain.history]);

  if (!ohlc.length) {
    return (
      <div style={{ color: "gray", textAlign: "center", padding: 40 }}>
        No gas price data yet for {chain.name}.
      </div>
    );
  }

  const data: ChartData<"candlestick"> = {
    datasets: [
      {
        label: `${chain.name} Gas Price`,
        data: ohlc,
        barPercentage: 0.3,
        categoryPercentage: 0.3,
        borderColor: "#8B5CF6",
      },
    ],
  };

  const options: ChartOptions<"candlestick"> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (ctx) {
            const raw = ctx.raw as any;
            const o = raw.o.toFixed(2);
            const h = raw.h.toFixed(2);
            const l = raw.l.toFixed(2);
            const c = raw.c.toFixed(2);
            return `O: ${o}  H: ${h}  L: ${l}  C: ${c} gwei`;
          },
        },
        backgroundColor: "#18181b",
        borderColor: "#8B5CF6",
        borderWidth: 1,
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "minute",
          tooltipFormat: "HH:mm:ss",
        },
        grid: {
          color: "#27272a",
        },
        ticks: {
          color: "#a1a1aa",
        },
      },
      y: {
        grid: {
          color: "#27272a",
        },
        ticks: {
          color: "#a1a1aa",
        },
      },
    },
  };

  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-crypto-purple" />
            Gas Price Volatility (Candlestick)
          </div>
          <Badge variant={mode === "live" ? "default" : "secondary"}>
            {mode === "live" ? "Live Data" : "Simulation"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ marginBottom: 16 }}>
          <select
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value)}
            style={{
              padding: 4,
              borderRadius: 4,
              background: "#18181b",
              color: "white",
            }}
          >
            {CHAIN_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div
          style={{
            height: 320,
            background: "#18181b",
            borderRadius: 8,
            padding: 8,
          }}
        >
          <Chart
            type="candlestick"
            data={data}
            options={options}
            style={{ height: 320 }}
          />
        </div>
        <div className="flex items-center gap-4 text-sm">
          {CHAIN_OPTIONS.map((opt) => (
            <div key={opt.key} className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  opt.key === "ethereum"
                    ? "bg-crypto-blue"
                    : opt.key === "polygon"
                    ? "bg-crypto-purple"
                    : "bg-crypto-orange"
                }`}
              ></div>
              <span>{opt.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>Auto-refresh: 6s</span>
        </div>
      </CardContent>
    </Card>
  );
}
