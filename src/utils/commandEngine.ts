/**
 * Command Mode Engines: Attribution + Strategy Recommendation
 *
 * computeCauses         — reads live store metrics, returns ranked congestion causes
 * recommendStrategies   — maps causes to actionable strategies
 */

import type {
  CongestionCause,
  CongestionCauseType,
  CommandStrategy,
  StrategyPermission,
} from '../stores/commandStore';
import type {
  PortDigestion,
  WeatherCoupling,
  SpecialEvent,
} from '../stores/overviewStore';

// ---------------------------------------------------------------------------
// Types — minimal slice of DashboardState so the engine stays decoupled
// ---------------------------------------------------------------------------

export interface EngineStoreSlice {
  portDigestion: Record<'xuwen' | 'haian', PortDigestion>;
  tidalEffect: { ratio: number };
  corridorPressure: Record<string, { pressure: number }>;
  weatherCoupling: WeatherCoupling;
  specialEvents: SpecialEvent[];
}

// ---------------------------------------------------------------------------
// Strategy database (static for now; will be API-driven later)
// ---------------------------------------------------------------------------

type StrategyMeta = Omit<CommandStrategy, 'status' | 'recommended'> & {
  reasonTemplate?: string;
  requiredResources?: Array<{
    type: 'police' | 'cone' | 'led_screen' | 'tow_truck';
    quantity: number;
    estimatedArrivalMin: number;
  }>;
  effectModel?: {
    baseEffect: number;
    factorModifiers: {
      weather_rain: number;
      weather_fog: number;
      truck_ratio_high: number;
      road_congested: number;
      inflow_high: number;
    };
  };
  historicalData?: {
    executionCount: number;
    successRate: number;
    avgReliefMinutes: number;
  };
};

const STRATEGY_DB: Record<string, StrategyMeta> = {
  'S-01': {
    id: 'S-01',
    name: '应急车道借用',
    permission: 'approve' as StrategyPermission,
    permissionLabel: '🔴 需审批',
    effect: '6.5 → 4.8',
    time: '约 30 分钟',
    reduce: '~350 辆',
    difficulty: 2,
    effectTime: '5 分钟生效',
    risk: '应急车辆通行受限，需保留紧急通道',
    triggerCondition: '进港大道拥堵指数 > 6.0 且排队 > 2km',
    reasonTemplate: '进港大道拥堵指数达到{congestionIndex}，排队长度{queueLength}，超过应急车道启用阈值。预计可增加{laneCapacity}%通行能力。',
    requiredResources: [
      { type: 'police', quantity: 4, estimatedArrivalMin: 8 },
      { type: 'cone', quantity: 20, estimatedArrivalMin: 10 },
      { type: 'led_screen', quantity: 2, estimatedArrivalMin: 15 },
    ],
    effectModel: {
      baseEffect: 1.7,
      factorModifiers: {
        weather_rain: -0.2,
        weather_fog: -0.15,
        truck_ratio_high: -0.1,
        road_congested: 0.15,
        inflow_high: 0.1,
      },
    },
    historicalData: {
      executionCount: 23,
      successRate: 0.87,
      avgReliefMinutes: 28,
    },
  },
  'S-02': {
    id: 'S-02',
    name: 'S376 省道分流',
    permission: 'confirm' as StrategyPermission,
    permissionLabel: '🟡 需确认',
    effect: '6.5 → 5.2',
    time: '约 20 分钟',
    reduce: '~200 辆',
    difficulty: 1,
    effectTime: '3 分钟生效',
    risk: 'S376 沿线居民出行受影响',
    triggerCondition: '进港大道拥堵指数 > 4.0',
    reasonTemplate: '进港大道拥堵指数{congestionIndex}，S376省道当前流量{s376Flow}%，具备分流条件。预计分流{divertRatio}%车流。',
    requiredResources: [
      { type: 'police', quantity: 2, estimatedArrivalMin: 5 },
      { type: 'cone', quantity: 15, estimatedArrivalMin: 8 },
      { type: 'led_screen', quantity: 1, estimatedArrivalMin: 12 },
    ],
    effectModel: {
      baseEffect: 1.3,
      factorModifiers: {
        weather_rain: -0.15,
        weather_fog: -0.1,
        truck_ratio_high: 0.05,
        road_congested: 0.1,
        inflow_high: 0.15,
      },
    },
    historicalData: {
      executionCount: 45,
      successRate: 0.91,
      avgReliefMinutes: 22,
    },
  },
  'S-04': {
    id: 'S-04',
    name: '信号灯配时优化',
    permission: 'confirm' as StrategyPermission,
    permissionLabel: '🟡 需确认',
    effect: '3.8 → 2.9',
    time: '约 15 分钟',
    reduce: '~120 辆',
    difficulty: 1,
    effectTime: '3 分钟生效',
    risk: '交叉方向通行效率降低约15%',
    triggerCondition: '关键路口饱和度 > 80%',
    reasonTemplate: '关键路口饱和度{saturation}%，主干道绿灯时长调整至{greenTime}秒，预计提升{improvement}%通行效率。',
    requiredResources: [
      { type: 'police', quantity: 1, estimatedArrivalMin: 3 },
    ],
    effectModel: {
      baseEffect: 0.9,
      factorModifiers: {
        weather_rain: -0.05,
        weather_fog: -0.05,
        truck_ratio_high: -0.1,
        road_congested: 0.2,
        inflow_high: 0.05,
      },
    },
    historicalData: {
      executionCount: 67,
      successRate: 0.94,
      avgReliefMinutes: 18,
    },
  },
  'S-05': {
    id: 'S-05',
    name: '港口增开班次',
    permission: 'approve' as StrategyPermission,
    permissionLabel: '🔴 需审批',
    effect: '消化+30%',
    time: '约 60 分钟',
    reduce: '~400 辆',
    difficulty: 3,
    effectTime: '30 分钟生效',
    risk: '需港口方配合，非县政府直接管辖',
    triggerCondition: '港口待舶车辆 > 800 辆',
    reasonTemplate: '港口待舶车辆{waitingVehicles}辆，当前消化速率{digestRate}辆/小时，增开班次后预计提升消化能力{improvement}%。',
    requiredResources: [],
    effectModel: {
      baseEffect: 1.5,
      factorModifiers: {
        weather_rain: -0.3,
        weather_fog: -0.5,
        truck_ratio_high: 0.0,
        road_congested: 0.0,
        inflow_high: 0.2,
      },
    },
    historicalData: {
      executionCount: 8,
      successRate: 0.75,
      avgReliefMinutes: 55,
    },
  },
  'S-07': {
    id: 'S-07',
    name: '事故快速处置',
    permission: 'auto' as StrategyPermission,
    permissionLabel: '🟢 自动执行',
    effect: '恢复通行',
    time: '约 45 分钟',
    reduce: '解除阻断',
    difficulty: 2,
    effectTime: '到场即生效',
    risk: '需交警+拖车协调',
    triggerCondition: '检测到交通事故',
    reasonTemplate: '检测到{location}发生交通事故，影响{laneCount}条车道，预计处置时间{estimatedMin}分钟。',
    requiredResources: [
      { type: 'police', quantity: 2, estimatedArrivalMin: 6 },
      { type: 'tow_truck', quantity: 1, estimatedArrivalMin: 12 },
      { type: 'cone', quantity: 10, estimatedArrivalMin: 6 },
    ],
    effectModel: {
      baseEffect: 2.0,
      factorModifiers: {
        weather_rain: -0.2,
        weather_fog: -0.1,
        truck_ratio_high: -0.15,
        road_congested: 0.3,
        inflow_high: 0.0,
      },
    },
    historicalData: {
      executionCount: 15,
      successRate: 0.93,
      avgReliefMinutes: 35,
    },
  },
  'S-09': {
    id: 'S-09',
    name: '诱导屏信息发布',
    permission: 'auto' as StrategyPermission,
    permissionLabel: '🟢 自动执行',
    effect: '分流5-10%',
    time: '即时',
    reduce: '~50 辆',
    difficulty: 0,
    effectTime: '即时生效',
    risk: '效果依赖驾驶员配合',
    triggerCondition: '任意拥堵策略执行时自动联动',
    reasonTemplate: '当前{roadName}拥堵指数{congestionIndex}，发布绕行建议至{screenCount}块诱导屏，引导车辆选择替代路线。',
    requiredResources: [
      { type: 'led_screen', quantity: 3, estimatedArrivalMin: 0 },
    ],
    effectModel: {
      baseEffect: 0.3,
      factorModifiers: {
        weather_rain: -0.05,
        weather_fog: -0.05,
        truck_ratio_high: -0.05,
        road_congested: 0.1,
        inflow_high: 0.1,
      },
    },
    historicalData: {
      executionCount: 89,
      successRate: 0.82,
      avgReliefMinutes: 12,
    },
  },
};

// Cause → applicable strategy IDs
const CAUSE_STRATEGY_MAP: Record<CongestionCauseType, string[]> = {
  port_backlog: ['S-01', 'S-02', 'S-05'],
  traffic_peak: ['S-04', 'S-09'],
  accident: ['S-07', 'S-02'],
  weather: ['S-09'],
  construction: ['S-02', 'S-04'],
  compound: [], // compound inherits from its sub-causes
};

// ---------------------------------------------------------------------------
// Label & description helpers
// ---------------------------------------------------------------------------

const CAUSE_LABELS: Record<CongestionCauseType, string> = {
  port_backlog: '港口积压型',
  traffic_peak: '流量高峰型',
  accident: '事故阻断型',
  weather: '天气影响型',
  construction: '施工占道型',
  compound: '复合型',
};

function confidenceColor(confidence: number): string {
  if (confidence > 60) return '#DC2626'; // red
  if (confidence > 30) return '#F59E0B'; // orange
  return '#A0A8B4'; // gray
}

function causeDescription(type: CongestionCauseType, state: EngineStoreSlice): string {
  switch (type) {
    case 'port_backlog': {
      const v = state.portDigestion.xuwen.waitingVehicles;
      const t = state.portDigestion.xuwen.digestionMinutes;
      const h = Math.floor(t / 60);
      const m = t % 60;
      return `徐闻港排队车辆 ${v} 辆，消化时间 ${h}h${m}min`;
    }
    case 'traffic_peak': {
      const holiday = state.specialEvents.find((e) => e.isHoliday);
      if (holiday) {
        return `${holiday.type}期间，车流量为日常 ${holiday.baselineMultiplier ?? '—'} 倍`;
      }
      return '当前处于流量高峰时段';
    }
    case 'accident':
      return '暂无事故数据源接入';
    case 'weather':
      return `气象耦合指数 ${state.weatherCoupling.overallScore}，${state.weatherCoupling.trend}`;
    case 'construction': {
      const evt = state.specialEvents.find((e) => !e.isHoliday && /施工/.test(e.type));
      return evt ? evt.description : '存在施工占道，影响通行能力';
    }
    case 'compound':
      return '多因素叠加，需综合施策';
  }
}

// ---------------------------------------------------------------------------
// 1. Attribution Engine
// ---------------------------------------------------------------------------

export function computeCauses(state: EngineStoreSlice): CongestionCause[] {
  const raw: { type: CongestionCauseType; confidence: number }[] = [];

  // Rule 1 — port_backlog
  const waiting = state.portDigestion.xuwen.waitingVehicles;
  if (waiting > 500) {
    raw.push({ type: 'port_backlog', confidence: Math.min(90, Math.round(waiting / 15)) });
  }

  // Rule 2 — traffic_peak (holiday)
  const holiday = state.specialEvents.find((e) => e.isHoliday);
  if (holiday) {
    const multiplier = holiday.baselineMultiplier ?? 1;
    raw.push({ type: 'traffic_peak', confidence: Math.min(90, Math.round(30 + multiplier * 10)) });
  }

  // Rule 3 — accident (placeholder, no data source yet)
  // Always 0 → will be filtered out

  // Rule 4 — weather
  if (state.weatherCoupling.overallScore > 50) {
    raw.push({ type: 'weather', confidence: Math.round(state.weatherCoupling.overallScore) });
  }

  // Rule 5 — construction
  const hasConstruction = state.specialEvents.some(
    (e) => !e.isHoliday && /施工/.test(e.type),
  );
  if (hasConstruction) {
    raw.push({ type: 'construction', confidence: 20 });
  }

  // Rule 6 — compound: 2+ causes with confidence > 30
  const significant = raw.filter((c) => c.confidence > 30);
  if (significant.length >= 2) {
    const maxConf = Math.max(...significant.map((c) => c.confidence));
    raw.push({ type: 'compound', confidence: Math.round(maxConf * 0.8) });
  }

  // Build full CongestionCause objects, filter zero/negative, sort desc
  return raw
    .filter((c) => c.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence)
    .map((c) => ({
      type: c.type,
      label: CAUSE_LABELS[c.type],
      confidence: c.confidence,
      description: causeDescription(c.type, state),
      color: confidenceColor(c.confidence),
    }));
}

// ---------------------------------------------------------------------------
// 2. Strategy Recommendation Engine
// ---------------------------------------------------------------------------

export function recommendStrategies(
  causes: CongestionCause[],
  _state: EngineStoreSlice,
): CommandStrategy[] {
  // Collect applicable strategy IDs in priority order (highest-confidence cause first)
  const seen = new Set<string>();
  const ordered: { id: string; causeConfidence: number }[] = [];

  for (const cause of causes) {
    // compound inherits from its sub-causes which are already in the list
    const ids = CAUSE_STRATEGY_MAP[cause.type] ?? [];
    for (const id of ids) {
      if (!seen.has(id)) {
        seen.add(id);
        ordered.push({ id, causeConfidence: cause.confidence });
      }
    }
  }

  // Sort by cause confidence match (desc), then by difficulty (asc)
  ordered.sort((a, b) => {
    if (b.causeConfidence !== a.causeConfidence) return b.causeConfidence - a.causeConfidence;
    const da = STRATEGY_DB[a.id]?.difficulty ?? 99;
    const db = STRATEGY_DB[b.id]?.difficulty ?? 99;
    return da - db;
  });

  // Build CommandStrategy[], mark only the top-ranked as recommended
  const results: CommandStrategy[] = [];
  for (let idx = 0; idx < ordered.length; idx++) {
    const meta = STRATEGY_DB[ordered[idx].id];
    if (!meta) continue;
    results.push({
      ...meta,
      recommended: idx === 0,
      status: 'idle' as const,
    });
  }
  return results;
}
