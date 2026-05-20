/**
 * Simulation engine for strategy comparison.
 * Strategies organized by main road / alternative road structure per construction plan.
 *
 * Strategy library:
 *  - 3 core diversion strategies (main road → alternative road)
 *  - 2 placeholder strategies (pending field survey confirmation)
 * Support actions (LED, parking, police checkpoint) are no longer independent strategies.
 */

import type { SimulatorParams, SimulationResult, AIRecommendation } from '../stores/simulatorStore';

interface StrategyEffectData {
  id: string;
  name: string;
  mainRoad: string;
  alternativeRoad: string;
  supportActions: string[];
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
  arrivalMin: number;
  historicalSuccessRate: number;
  avgReliefMinutes: number;
  diversionBase: number;
}

const STRATEGY_EFFECTS: Record<string, StrategyEffectData> = {
  'S-01': {
    id: 'S-01', name: '进港大道 → S376 省道分流',
    mainRoad: '进港大道关键段',
    alternativeRoad: 'S376 省道',
    supportActions: ['诱导屏发布分流引导', '设卡核验预约时段', '临时停车区承接早到车辆'],
    effectModel: { baseEffect: 1.3, factorModifiers: { weather_rain: -0.15, weather_fog: -0.1, truck_ratio_high: 0.05, road_congested: 0.1, inflow_high: 0.15 } },
    arrivalMin: 5, historicalSuccessRate: 0.91, avgReliefMinutes: 22, diversionBase: 200,
  },
  'S-02': {
    id: 'S-02', name: '徐海路 → 环半岛公路分流',
    mainRoad: '徐海路',
    alternativeRoad: '环半岛公路',
    supportActions: ['诱导屏发布通道引导', '设卡引导分流'],
    effectModel: { baseEffect: 1.1, factorModifiers: { weather_rain: -0.1, weather_fog: -0.1, truck_ratio_high: 0.0, road_congested: 0.15, inflow_high: 0.1 } },
    arrivalMin: 8, historicalSuccessRate: 0.83, avgReliefMinutes: 26, diversionBase: 180,
  },
  'S-03': {
    id: 'S-03', name: '全面管控 → 多路分流 + 临时停车',
    mainRoad: '进港大道-徐海路全段',
    alternativeRoad: '多路并行 + 临时停车区',
    supportActions: ['诱导屏全网发布', '多点设卡', '启用临时停车区', '应急物资保障', '无人机巡查'],
    effectModel: { baseEffect: 1.6, factorModifiers: { weather_rain: -0.15, weather_fog: -0.1, truck_ratio_high: -0.05, road_congested: 0.2, inflow_high: 0.15 } },
    arrivalMin: 22, historicalSuccessRate: 0.81, avgReliefMinutes: 38, diversionBase: 320,
  },
  'S-04': {
    id: 'S-04', name: '应急车道借用（待踏勘确认）',
    mainRoad: '进港大道关键段',
    alternativeRoad: '主路应急车道临时开放',
    supportActions: ['诱导屏发布', '交警现场管控', '保留紧急通道'],
    effectModel: { baseEffect: 1.7, factorModifiers: { weather_rain: -0.2, weather_fog: -0.15, truck_ratio_high: -0.1, road_congested: 0.15, inflow_high: 0.1 } },
    arrivalMin: 8, historicalSuccessRate: 0.87, avgReliefMinutes: 28, diversionBase: 350,
  },
  'S-05': {
    id: 'S-05', name: '远端拦截分流（待踏勘确认）',
    mainRoad: '进港大道上游路口',
    alternativeRoad: '上游路口提前分流至 S376 / 环半岛公路',
    supportActions: ['上游诱导屏预警', '上游设卡引导', '临时停车区承接'],
    effectModel: { baseEffect: 1.0, factorModifiers: { weather_rain: -0.1, weather_fog: -0.1, truck_ratio_high: 0.0, road_congested: 0.1, inflow_high: 0.2 } },
    arrivalMin: 10, historicalSuccessRate: 0.78, avgReliefMinutes: 30, diversionBase: 220,
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
    const noise = (Math.sin(t * 0.3) * 0.05);
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
  if (strategyData.id === 'S-01' || strategyData.id === 'S-02') {
    // Diversion ratio affects effectiveness (main road → alternative road)
    const ratio = strategyParams?.diversionRatio ?? 30;
    strategyBonus = (ratio - 20) * 0.01;
  } else if (strategyData.id === 'S-03') {
    // Full control mode: parking capacity affects effectiveness
    const capacity = strategyParams?.parkingCapacity ?? 300;
    strategyBonus = (capacity - 200) * 0.001;
  } else if (strategyData.id === 'S-04') {
    // Emergency lane borrow: weather/truck constraints
    if (env.weather === 'rain' || env.weather === 'fog') strategyBonus -= 0.1;
  } else if (strategyData.id === 'S-05') {
    // Upstream early diversion: more effective when inflow is high
    if (env.inflowRate === 'high') strategyBonus = 0.2;
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
    const noise = Math.sin(t * 0.5 + strategyData.arrivalMin) * 0.03;
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
