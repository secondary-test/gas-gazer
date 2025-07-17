import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGasStore } from "@/store/gasStore";
import { Activity, Calculator } from "lucide-react";

export function ModeToggle() {
  const { mode, setMode } = useGasStore();

  return (
    <div className="flex items-center gap-2 p-1 bg-secondary rounded-lg">
      <Button
        variant={mode === 'live' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setMode('live')}
        className={mode === 'live' ? 'bg-gradient-primary text-white' : ''}
      >
        <Activity className="h-4 w-4 mr-2" />
        Live Mode
      </Button>
      <Button
        variant={mode === 'simulation' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setMode('simulation')}
        className={mode === 'simulation' ? 'bg-gradient-primary text-white' : ''}
      >
        <Calculator className="h-4 w-4 mr-2" />
        Simulation
      </Button>
    </div>
  );
}