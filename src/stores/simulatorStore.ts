import { create } from 'zustand';

// Common environment parameters
export interface CommonEnvParams {
  weather: 'clear' | 'rain' | 'fog';
  trafficVolume: 'low' | 'medium' | 'high';
  truckRatio: 'low' | 'medium' | 'high';
  portCapacity: 'normal' | 'reduced' | 'enhanced';
  timePeriod: 'morning' | 'noon' | 'evening' | 'night';
  inflowRate: 'low' | 'medium' | 'high';
}

// Strategy-specific parameters
export interface StrategySpecificParams {
  // S-02/S-03: Diversion strategies
  diversionRatio?: number; // 10-50 for S-02, 10-30 for S-03

  // S-04: Signal timing
  signalPlan?: 'A' | 'B' | 'C';
  greenLightDuration?: number; // seconds

  // S-06: Flow restriction
  releaseInterval?: number; // minutes
  vehiclesPerBatch?: number;

  // S-07: Accident response
  accidentLevel?: 'minor' | 'moderate' | 'severe';
  resourceLevel?: 'level1' | 'level2' | 'level3';

  // S-08: Parking area
  parkingCapacity?: number; // vehicles
  activationScope?: 'partial' | 'full';

  // S-11: Time-sharing
  passengerPriorityHours?: string; // e.g., "08:00-10:00,14:00-18:00"
  cargoRestrictionHours?: string;

  // S-15: Appointment
  appointmentCoverage?: number; // 0-100%
  slotCapacity?: number; // vehicles per hour
}

// Simulation parameters
export interface SimulatorParams {
  selectedStrategies: string[]; // strategy IDs from STRATEGY_DB
  commonEnv: CommonEnvParams;
  strategyParams: Record<string, StrategySpecificParams>; // keyed by strategy ID
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
  setCommonEnv: <K extends keyof CommonEnvParams>(key: K, value: CommonEnvParams[K]) => void;
  setStrategyParam: (strategyId: string, key: keyof StrategySpecificParams, value: any) => void;
  setSelectedStrategies: (strategies: string[]) => void;
  runSimulation: () => void;
  clearResults: () => void;
}

// Default parameters
const DEFAULT_COMMON_ENV: CommonEnvParams = {
  weather: 'clear',
  trafficVolume: 'high',
  truckRatio: 'medium',
  portCapacity: 'normal',
  timePeriod: 'morning',
  inflowRate: 'high',
};

const DEFAULT_PARAMS: SimulatorParams = {
  selectedStrategies: ['S-01', 'S-02'],
  commonEnv: DEFAULT_COMMON_ENV,
  strategyParams: {},
};

export const useSimulatorStore = create<SimulatorState & SimulatorActions>((set, get) => ({
  params: DEFAULT_PARAMS,
  results: [],
  baselineCurve: [],
  isSimulating: false,
  aiRecommendation: null,

  setCommonEnv: (key, value) => set((state) => ({
    params: { ...state.params, commonEnv: { ...state.params.commonEnv, [key]: value } },
  })),

  setStrategyParam: (strategyId, key, value) => set((state) => ({
    params: {
      ...state.params,
      strategyParams: {
        ...state.params.strategyParams,
        [strategyId]: {
          ...state.params.strategyParams[strategyId],
          [key]: value,
        },
      },
    },
  })),

  setSelectedStrategies: (strategies) => set((state) => ({
    params: { ...state.params, selectedStrategies: strategies },
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
