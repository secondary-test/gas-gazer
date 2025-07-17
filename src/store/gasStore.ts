import { create } from 'zustand';

export interface GasPoint {
  timestamp: number;
  baseFee: number;
  priorityFee: number;
  totalFee: number;
}

export interface ChainData {
  name: string;
  symbol: string;
  baseFee: number;
  priorityFee: number;
  history: GasPoint[];
  isConnected: boolean;
  lastUpdate: number;
}

export interface SimulationResult {
  chain: string;
  gasCostUsd: number;
  totalCostUsd: number;
  gasLimit: number;
}

interface GasState {
  mode: 'live' | 'simulation';
  chains: {
    ethereum: ChainData;
    polygon: ChainData;
    arbitrum: ChainData;
  };
  usdPrice: number;
  simulation: {
    amount: string;
    gasLimit: number;
    results: SimulationResult[];
  };
  setMode: (mode: 'live' | 'simulation') => void;
  updateChainData: (chain: keyof GasState['chains'], data: Partial<ChainData> | ((prev: ChainData) => Partial<ChainData>)) => void;
  setUsdPrice: (price: number) => void;
  updateSimulation: (amount: string, gasLimit: number) => void;
  calculateSimulation: () => void;
}

export const useGasStore = create<GasState>((set, get) => ({
  mode: 'live',
  chains: {
    ethereum: {
      name: 'Ethereum',
      symbol: 'ETH',
      baseFee: 0,
      priorityFee: 0,
      history: [],
      isConnected: false,
      lastUpdate: 0,
    },
    polygon: {
      name: 'Polygon',
      symbol: 'MATIC',
      baseFee: 0,
      priorityFee: 0,
      history: [],
      isConnected: false,
      lastUpdate: 0,
    },
    arbitrum: {
      name: 'Arbitrum',
      symbol: 'ETH',
      baseFee: 0,
      priorityFee: 0,
      history: [],
      isConnected: false,
      lastUpdate: 0,
    },
  },
  usdPrice: 0,
  simulation: {
    amount: '0.1',
    gasLimit: 21000,
    results: [],
  },

  setMode: (mode) => set({ mode }),

  updateChainData: (chain, dataOrUpdater) =>
    set((state) => {
      const prev = state.chains[chain];
      const data = typeof dataOrUpdater === 'function' ? dataOrUpdater(prev) : dataOrUpdater;
      return {
        chains: {
          ...state.chains,
          [chain]: {
            ...prev,
            ...data,
            lastUpdate: Date.now(),
          },
        },
      };
    }),

  setUsdPrice: (usdPrice) => set({ usdPrice }),

  updateSimulation: (amount, gasLimit) =>
    set((state) => ({
      simulation: {
        ...state.simulation,
        amount,
        gasLimit,
      },
    })),

  calculateSimulation: () => {
    const state = get();
    const results: SimulationResult[] = [];

    Object.entries(state.chains).forEach(([key, chain]) => {
      const totalGasFee = (chain.baseFee + chain.priorityFee) / 1e9;
      const gasCostEth = totalGasFee * state.simulation.gasLimit;
      const gasCostUsd = gasCostEth * state.usdPrice;
      const transactionValueUsd = parseFloat(state.simulation.amount) * state.usdPrice;
      const totalCostUsd = gasCostUsd + transactionValueUsd;

      results.push({
        chain: key,
        gasCostUsd,
        totalCostUsd,
        gasLimit: state.simulation.gasLimit,
      });
    });

    set((state) => ({
      simulation: {
        ...state.simulation,
        results,
      },
    }));
  },
}));