import { create } from 'zustand';

// Simulation parameters
export interface SimulatorParams {
  selectedStrategies: string[]; // strategy IDs from STRATEGY_DB
  weather: 'clear' | 'rain' | 'fog';
  trafficVolume: 'low' | 'medium' | 'high';
  truckRatio: 'low' | 'medium' | 'high';
  diversionRoadStatus: 'smooth' | 'congested';
  portCapacity: 'normal' | 'reduced' | 'enhanced';
  timePeriod: 'morning' | 'noon' | 'evening' | 'night';
  inflowRate: 'low' | 'medium' | 'high';
  signalPlan: 'default' | 'peak' | 'emergency';
}

// Simulation result for a single strategy
export interface SimulationResult {
  strategyId: string;
  strategyName: string;
  curve: Array<{ time: number; congestion: number }>; // time in minutes, congestion index
  reliefMinutes: number; // time to reach target (3.0)
  diversionVolume: number; // vehicles diverted
  successRate: number; // 0-1
  confidence: number; // 0-100
}

// AI recommendation
export interface AIRecommendation {
  bestStrategyId: string;
  reason: string;
  expectedReliefTime: number;
  riskFactors: string[];
}

// Store state
interface SimulatorState {
  params: SimulatorParams;
  results: SimulationResult[];
  baselineCurve: Array<{ time: number; congestion: number }>; // "no intervention"
  isSimulating: boolean;
  aiRecommendation: AIRecommendation | null;
}

// Store actions
interface SimulatorActions {
  setParam: <K extends keyof SimulatorParams>(key: K, value: SimulatorParams[K]) => void;
  runSimulation: () => void;
  clearResults: () => void;
}

// Default parameters
const DEFAULT_PARAMS: SimulatorParams = {
  selectedStrategies: ['S-01', 'S-02'],
  weather: 'clear',
  trafficVolume: 'high',
  truckRatio: 'medium',
  diversionRoadStatus: 'smooth',
  portCapacity: 'normal',
  timePeriod: 'morning',
  inflowRate: 'high',
  signalPlan: 'default',
};

export const useSimulatorStore = create<SimulatorState & SimulatorActions>((set, get) => ({
  params: DEFAULT_PARAMS,
  results: [],
  baselineCurve: [],
  isSimulating: false,
  aiRecommendation: null,

  setParam: (key, value) => set((state) => ({
    params: { ...state.params, [key]: value },
  })),

  runSimulation: async () => {
    const { params } = get();
    set({ isSimulating: true });

    // Import simulation engine dynamically to avoid circular deps
    const { simulateStrategies, generateBaselineCurve, generateAIRecommendation } = await import('../utils/simulationEngine');

    const baselineCurve = generateBaselineCurve();
    const results = simulateStrategies(params);
    const aiRecommendation = generateAIRecommendation(results, params);

    set({
      results,
      baselineCurve,
      aiRecommendation,
      isSimulating: false,
    });
  },

  clearResults: () => set({
    results: [],
    baselineCurve: [],
    aiRecommendation: null,
  }),
}));
