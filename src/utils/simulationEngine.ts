/**
 * Simulation engine for strategy comparison.
 * Uses effectModel from STRATEGY_DB in commandEngine.ts
 */

import type { SimulatorParams, SimulationResult, AIRecommendation } from '../stores/simulatorStore';

// Re-define strategy data locally to avoid coupling with commandEngine's internal types.
// This mirrors the effectModel + requiredResources + historicalData from STRATEGY_DB.
interface StrategyEffectData {
  id: string;
  name: string;
  effectModel: {
    baseEffect: number;
    factorModifiers: {
      weather_rain: number;
      weather_fog: number;
      truck_ratio_high: number;
      road_congested: number;
      inflow_high: number;
    };
  };
  arrivalMin: number; // first resource arrival time
  historicalSuccessRate: number;
  avgReliefMinutes: number;
  diversionBase: number; // base diversion volume
}

const STRATEGY_EFFECTS: Record<string, StrategyEffectData> = {
  'S-01': {
    id: 'S-01', name: '应急车道开放',
    effectModel: { baseEffect: 1.7, factorModifiers: { weather_rain: -0.2, weather_fog: -0.15, truck_ratio_high: -0.1, road_congested: 0.15, inflow_high: 0.1 } },
    arrivalMin: 8, historicalSuccessRate: 0.87, avgReliefMinutes: 28, diversionBase: 350,
  },
  'S-02': {
    id: 'S-02', name: 'S376 省道分流',
    effectModel: { baseEffect: 1.3, factorModifiers: { weather_rain: -0.15, weather_fog: -0.1, truck_ratio_high: 0.05, road_congested: 0.1, inflow_high: 0.15 } },
    arrivalMin: 5, historicalSuccessRate: 0.91, avgReliefMinutes: 22, diversionBase: 200,
  },
  'S-03': {
    id: 'S-03', name: '进港大道信号灯优化',
    effectModel: { baseEffect: 0.9, factorModifiers: { weather_rain: -0.05, weather_fog: -0.05, truck_ratio_high: -0.1, road_congested: 0.2, inflow_high: 0.05 } },
    arrivalMin: 3, historicalSuccessRate: 0.94, avgReliefMinutes: 18, diversionBase: 120,
  },
  'S-04': {
    id: 'S-04', name: '诱导屏引导',
    effectModel: { baseEffect: 0.3, factorModifiers: { weather_rain: -0.05, weather_fog: -0.05, truck_ratio_high: -0.05, road_congested: 0.1, inflow_high: 0.1 } },
    arrivalMin: 0, historicalSuccessRate: 0.82, avgReliefMinutes: 12, diversionBase: 50,
  },
  'S-05': {
    id: 'S-05', name: '港口增开班次',
    effectModel: { baseEffect: 1.5, factorModifiers: { weather_rain: -0.3, weather_fog: -0.5, truck_ratio_high: 0.0, road_congested: 0.0, inflow_high: 0.2 } },
    arrivalMin: 30, historicalSuccessRate: 0.75, avgReliefMinutes: 55, diversionBase: 400,
  },
  'S-06': {
    id: 'S-06', name: '临时停车场启用',
    effectModel: { baseEffect: 0.8, factorModifiers: { weather_rain: -0.1, weather_fog: -0.05, truck_ratio_high: 0.15, road_congested: 0.1, inflow_high: 0.2 } },
    arrivalMin: 15, historicalSuccessRate: 0.78, avgReliefMinutes: 32, diversionBase: 180,
  },
  'S-07': {
    id: 'S-07', name: '事故快速处置',
    effectModel: { baseEffect: 2.0, factorModifiers: { weather_rain: -0.2, weather_fog: -0.1, truck_ratio_high: -0.15, road_congested: 0.3, inflow_high: 0.0 } },
    arrivalMin: 6, historicalSuccessRate: 0.93, avgReliefMinutes: 35, diversionBase: 0,
  },
  'S-08': {
    id: 'S-08', name: '交警现场疏导',
    effectModel: { baseEffect: 1.2, factorModifiers: { weather_rain: -0.15, weather_fog: -0.2, truck_ratio_high: -0.1, road_congested: 0.25, inflow_high: 0.05 } },
    arrivalMin: 10, historicalSuccessRate: 0.89, avgReliefMinutes: 25, diversionBase: 150,
  },
  'S-09': {
    id: 'S-09', name: '社会化停车场协调',
    effectModel: { baseEffect: 0.6, factorModifiers: { weather_rain: -0.05, weather_fog: -0.05, truck_ratio_high: 0.1, road_congested: 0.05, inflow_high: 0.15 } },
    arrivalMin: 20, historicalSuccessRate: 0.72, avgReliefMinutes: 40, diversionBase: 220,
  },
  'S-10': {
    id: 'S-10', name: '公交专线调度',
    effectModel: { baseEffect: 0.5, factorModifiers: { weather_rain: -0.1, weather_fog: -0.15, truck_ratio_high: 0.0, road_congested: 0.05, inflow_high: 0.1 } },
    arrivalMin: 25, historicalSuccessRate: 0.68, avgReliefMinutes: 45, diversionBase: 100,
  },
  'S-11': {
    id: 'S-11', name: '货车限行',
    effectModel: { baseEffect: 1.4, factorModifiers: { weather_rain: -0.05, weather_fog: -0.05, truck_ratio_high: 0.4, road_congested: 0.15, inflow_high: 0.1 } },
    arrivalMin: 12, historicalSuccessRate: 0.85, avgReliefMinutes: 30, diversionBase: 280,
  },
  'S-12': {
    id: 'S-12', name: '预约通行',
    effectModel: { baseEffect: 1.1, factorModifiers: { weather_rain: -0.05, weather_fog: -0.05, truck_ratio_high: 0.05, road_congested: 0.1, inflow_high: 0.25 } },
    arrivalMin: 0, historicalSuccessRate: 0.80, avgReliefMinutes: 50, diversionBase: 300,
  },
  'S-13': {
    id: 'S-13', name: '动态车道调整',
    effectModel: { baseEffect: 1.0, factorModifiers: { weather_rain: -0.1, weather_fog: -0.1, truck_ratio_high: -0.05, road_congested: 0.2, inflow_high: 0.1 } },
    arrivalMin: 18, historicalSuccessRate: 0.83, avgReliefMinutes: 28, diversionBase: 200,
  },
  'S-14': {
    id: 'S-14', name: '远端分流预警',
    effectModel: { baseEffect: 0.7, factorModifiers: { weather_rain: -0.05, weather_fog: -0.1, truck_ratio_high: 0.05, road_congested: 0.15, inflow_high: 0.2 } },
    arrivalMin: 0, historicalSuccessRate: 0.76, avgReliefMinutes: 35, diversionBase: 160,
  },
  'S-15': {
    id: 'S-15', name: '应急通道启用',
    effectModel: { baseEffect: 1.6, factorModifiers: { weather_rain: -0.15, weather_fog: -0.1, truck_ratio_high: -0.05, road_congested: 0.2, inflow_high: 0.15 } },
    arrivalMin: 22, historicalSuccessRate: 0.81, avgReliefMinutes: 38, diversionBase: 320,
  },
};

const SIMULATION_DURATION = 120; // minutes
const SIMULATION_INTERVAL = 5; // data point every 5 minutes
const STARTING_CONGESTION = 6.5;
const TARGET_CONGESTION = 3.0;

/**
 * Compute effective modifier based on simulation params.
 */
function computeModifier(params: SimulatorParams, modifiers: StrategyEffectData['effectModel']['factorModifiers']): number {
  let mod = 0;
  const env = params.commonEnv;
  if (env.weather === 'rain') mod += modifiers.weather_rain;
  if (env.weather === 'fog') mod += modifiers.weather_fog;
  if (env.truckRatio === 'high') mod += modifiers.truck_ratio_high;
  if (env.inflowRate === 'high') mod += modifiers.inflow_high;
  // Note: road_congested modifier removed as it's now strategy-specific
  return mod;
}

/**
 * Generate baseline curve (no intervention) — congestion stays high with slight natural decay.
 */
export function generateBaselineCurve(): Array<{ time: number; congestion: number }> {
  const points: Array<{ time: number; congestion: number }> = [];
  for (let t = 0; t <= SIMULATION_DURATION; t += SIMULATION_INTERVAL) {
    // Natural decay is very slow without intervention
    const naturalDecay = 0.005 * t;
    const noise = (Math.sin(t * 0.3) * 0.15);
    const congestion = Math.max(TARGET_CONGESTION + 0.5, STARTING_CONGESTION - naturalDecay + noise);
    points.push({ time: t, congestion: Math.round(congestion * 100) / 100 });
  }
  return points;
}

/**
 * Simulate a single strategy and return its congestion curve.
 */
function simulateStrategy(strategyData: StrategyEffectData, params: SimulatorParams, strategyParams?: any): SimulationResult {
  const modifier = computeModifier(params, strategyData.effectModel.factorModifiers);
  const effectiveEffect = Math.max(0.1, strategyData.effectModel.baseEffect + modifier);

  const env = params.commonEnv;

  // Volume multiplier from traffic volume param
  const volumeMultiplier = env.trafficVolume === 'high' ? 0.85 : env.trafficVolume === 'medium' ? 1.0 : 1.15;
  // Port capacity affects strategies differently
  const portMultiplier = env.portCapacity === 'enhanced' ? 1.1 : env.portCapacity === 'reduced' ? 0.8 : 1.0;

  // Strategy-specific parameter bonuses
  let strategyBonus = 0;
  if (strategyData.id === 'S-02' || strategyData.id === 'S-03') {
    // Diversion ratio affects effectiveness
    const ratio = strategyParams?.diversionRatio ?? (strategyData.id === 'S-02' ? 30 : 20);
    strategyBonus = (ratio - 20) * 0.01; // Higher ratio = more effect
  } else if (strategyData.id === 'S-04') {
    // Signal plan affects effectiveness
    const plan = strategyParams?.signalPlan ?? 'A';
    strategyBonus = plan === 'C' ? 0.3 : plan === 'B' ? 0.2 : 0.1;
  } else if (strategyData.id === 'S-06') {
    // Flow restriction effectiveness
    const interval = strategyParams?.releaseInterval ?? 5;
    strategyBonus = (10 - interval) * 0.02; // Shorter interval = more flow = more effect
  } else if (strategyData.id === 'S-07') {
    // Accident response level
    const level = strategyParams?.resourceLevel ?? 'level2';
    strategyBonus = level === 'level3' ? 0.3 : level === 'level2' ? 0.15 : 0;
  } else if (strategyData.id === 'S-08') {
    // Parking capacity
    const capacity = strategyParams?.parkingCapacity ?? 300;
    strategyBonus = (capacity - 200) * 0.001;
  } else if (strategyData.id === 'S-11') {
    // Time-sharing effectiveness (higher in high truck ratio scenarios)
    if (env.truckRatio === 'high') strategyBonus = 0.25;
  } else if (strategyData.id === 'S-15') {
    // Appointment coverage
    const coverage = strategyParams?.appointmentCoverage ?? 50;
    strategyBonus = coverage * 0.003;
  }

  // Time period affects effectiveness
  const timeMult = env.timePeriod === 'night' ? 1.2 : env.timePeriod === 'evening' ? 0.9 : 1.0;

  const totalEffect = effectiveEffect * volumeMultiplier * portMultiplier * timeMult + strategyBonus;
  const arrivalTime = strategyData.arrivalMin;

  // Generate curve using exponential decay after resource arrival
  const curve: Array<{ time: number; congestion: number }> = [];
  let reliefMinutes = SIMULATION_DURATION; // default: never reaches target

  for (let t = 0; t <= SIMULATION_DURATION; t += SIMULATION_INTERVAL) {
    let congestion: number;
    if (t < arrivalTime) {
      // Before resources arrive: slight natural increase
      congestion = STARTING_CONGESTION + 0.02 * t;
    } else {
      // Exponential decay after arrival
      const elapsed = t - arrivalTime;
      const decayRate = totalEffect / 40; // normalized decay constant
      const drop = (STARTING_CONGESTION - TARGET_CONGESTION) * (1 - Math.exp(-decayRate * elapsed));
      congestion = STARTING_CONGESTION - drop;
    }
    // Add slight noise for realism
    const noise = Math.sin(t * 0.5 + strategyData.arrivalMin) * 0.08;
    congestion = Math.max(TARGET_CONGESTION * 0.9, congestion + noise);
    congestion = Math.round(congestion * 100) / 100;
    curve.push({ time: t, congestion });

    if (congestion <= TARGET_CONGESTION && reliefMinutes === SIMULATION_DURATION) {
      reliefMinutes = t;
    }
  }

  // Compute confidence based on historical data and param alignment
  const baseConfidence = strategyData.historicalSuccessRate * 100;
  const weatherPenalty = env.weather !== 'clear' ? 8 : 0;
  const confidence = Math.round(Math.min(95, Math.max(30, baseConfidence - weatherPenalty)));

  return {
    strategyId: strategyData.id,
    strategyName: strategyData.name,
    curve,
    reliefMinutes,
    diversionVolume: Math.round(strategyData.diversionBase * volumeMultiplier * portMultiplier),
    successRate: Math.round(strategyData.historicalSuccessRate * totalEffect / strategyData.effectModel.baseEffect * 100) / 100,
    confidence,
  };
}

/**
 * Run simulation for all selected strategies.
 */
export function simulateStrategies(params: SimulatorParams): SimulationResult[] {
  return params.selectedStrategies
    .map((id) => STRATEGY_EFFECTS[id])
    .filter(Boolean)
    .map((data) => simulateStrategy(data, params, params.strategyParams[data.id]));
}

/**
 * Pick the best strategy and generate AI recommendation.
 */
export function generateAIRecommendation(results: SimulationResult[], params: SimulatorParams): AIRecommendation | null {
  if (results.length === 0) return null;

  // Score: lower relief time + higher confidence = better
  const scored = results.map((r) => ({
    ...r,
    score: (SIMULATION_DURATION - r.reliefMinutes) * 0.6 + r.confidence * 0.4,
  }));
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  const env = params.commonEnv;
  const riskFactors: string[] = [];
  if (env.weather === 'rain') riskFactors.push('降雨天气降低策略效果');
  if (env.weather === 'fog') riskFactors.push('大雾天气严重影响港口班次和能见度');
  if (env.inflowRate === 'high') riskFactors.push('高流入量可能导致策略效果延迟');
  if (env.truckRatio === 'high') riskFactors.push('货车比例高，车道利用率下降');

  return {
    bestStrategyId: best.strategyId,
    reason: `综合模拟分析，「${best.strategyName}」在当前参数下预计 ${best.reliefMinutes} 分钟缓解拥堵至目标值，置信度 ${best.confidence}%，历史成功率 ${Math.round(best.successRate * 100)}%。`,
    expectedReliefTime: best.reliefMinutes,
    riskFactors,
  };
}
