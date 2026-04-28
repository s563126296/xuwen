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
    id: 'S-01', name: '应急车道借用',
    effectModel: { baseEffect: 1.7, factorModifiers: { weather_rain: -0.2, weather_fog: -0.15, truck_ratio_high: -0.1, road_congested: 0.15, inflow_high: 0.1 } },
    arrivalMin: 8, historicalSuccessRate: 0.87, avgReliefMinutes: 28, diversionBase: 350,
  },
  'S-02': {
    id: 'S-02', name: 'S376 省道分流',
    effectModel: { baseEffect: 1.3, factorModifiers: { weather_rain: -0.15, weather_fog: -0.1, truck_ratio_high: 0.05, road_congested: 0.1, inflow_high: 0.15 } },
    arrivalMin: 5, historicalSuccessRate: 0.91, avgReliefMinutes: 22, diversionBase: 200,
  },
  'S-04': {
    id: 'S-04', name: '信号灯配时优化',
    effectModel: { baseEffect: 0.9, factorModifiers: { weather_rain: -0.05, weather_fog: -0.05, truck_ratio_high: -0.1, road_congested: 0.2, inflow_high: 0.05 } },
    arrivalMin: 3, historicalSuccessRate: 0.94, avgReliefMinutes: 18, diversionBase: 120,
  },
  'S-05': {
    id: 'S-05', name: '港口增开班次',
    effectModel: { baseEffect: 1.5, factorModifiers: { weather_rain: -0.3, weather_fog: -0.5, truck_ratio_high: 0.0, road_congested: 0.0, inflow_high: 0.2 } },
    arrivalMin: 30, historicalSuccessRate: 0.75, avgReliefMinutes: 55, diversionBase: 400,
  },
  'S-07': {
    id: 'S-07', name: '事故快速处置',
    effectModel: { baseEffect: 2.0, factorModifiers: { weather_rain: -0.2, weather_fog: -0.1, truck_ratio_high: -0.15, road_congested: 0.3, inflow_high: 0.0 } },
    arrivalMin: 6, historicalSuccessRate: 0.93, avgReliefMinutes: 35, diversionBase: 0,
  },
  'S-09': {
    id: 'S-09', name: '诱导屏信息发布',
    effectModel: { baseEffect: 0.3, factorModifiers: { weather_rain: -0.05, weather_fog: -0.05, truck_ratio_high: -0.05, road_congested: 0.1, inflow_high: 0.1 } },
    arrivalMin: 0, historicalSuccessRate: 0.82, avgReliefMinutes: 12, diversionBase: 50,
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
  if (params.weather === 'rain') mod += modifiers.weather_rain;
  if (params.weather === 'fog') mod += modifiers.weather_fog;
  if (params.truckRatio === 'high') mod += modifiers.truck_ratio_high;
  if (params.diversionRoadStatus === 'congested') mod += modifiers.road_congested;
  if (params.inflowRate === 'high') mod += modifiers.inflow_high;
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
function simulateStrategy(strategyData: StrategyEffectData, params: SimulatorParams): SimulationResult {
  const modifier = computeModifier(params, strategyData.effectModel.factorModifiers);
  const effectiveEffect = Math.max(0.1, strategyData.effectModel.baseEffect + modifier);

  // Volume multiplier from traffic volume param
  const volumeMultiplier = params.trafficVolume === 'high' ? 0.85 : params.trafficVolume === 'medium' ? 1.0 : 1.15;
  // Port capacity affects strategies differently
  const portMultiplier = params.portCapacity === 'enhanced' ? 1.1 : params.portCapacity === 'reduced' ? 0.8 : 1.0;
  // Signal plan bonus for signal-related strategies
  const signalBonus = (strategyData.id === 'S-04' && params.signalPlan === 'peak') ? 0.2 : 0;
  // Time period affects effectiveness
  const timeMult = params.timePeriod === 'night' ? 1.2 : params.timePeriod === 'evening' ? 0.9 : 1.0;

  const totalEffect = effectiveEffect * volumeMultiplier * portMultiplier * timeMult + signalBonus;
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
  const weatherPenalty = params.weather !== 'clear' ? 8 : 0;
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
    .map((data) => simulateStrategy(data, params));
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

  const riskFactors: string[] = [];
  if (params.weather === 'rain') riskFactors.push('降雨天气降低策略效果');
  if (params.weather === 'fog') riskFactors.push('大雾天气严重影响港口班次和能见度');
  if (params.inflowRate === 'high') riskFactors.push('高流入量可能导致策略效果延迟');
  if (params.diversionRoadStatus === 'congested') riskFactors.push('分流道路已拥堵，分流效果受限');
  if (params.truckRatio === 'high') riskFactors.push('货车比例高，车道利用率下降');

  return {
    bestStrategyId: best.strategyId,
    reason: `综合模拟分析，「${best.strategyName}」在当前参数下预计 ${best.reliefMinutes} 分钟缓解拥堵至目标值，置信度 ${best.confidence}%，历史成功率 ${Math.round(best.successRate * 100)}%。`,
    expectedReliefTime: best.reliefMinutes,
    riskFactors,
  };
}
