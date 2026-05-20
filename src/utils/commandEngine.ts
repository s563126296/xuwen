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
    name: '徐海路 → 环半岛公路分流',
    permission: 'confirm' as StrategyPermission,
    permissionLabel: '🟡 需确认',
    effect: '6.0 → 4.5',
    time: '约 25 分钟',
    reduce: '~180 辆',
    difficulty: 1,
    effectTime: '8 分钟生效',
    risk: '环半岛公路日常限大车，需临时放开小车通行',
    triggerCondition: '徐海路车速 < 20km/h 持续 10 分钟',
    reasonTemplate: '徐海路车速降至{speed}km/h，环半岛公路当前流量{altFlow}%，具备分流条件。预计分流{divertRatio}%车流。',
    requiredResources: [
      { type: 'police', quantity: 2, estimatedArrivalMin: 5 },
      { type: 'cone', quantity: 12, estimatedArrivalMin: 8 },
      { type: 'led_screen', quantity: 1, estimatedArrivalMin: 12 },
    ],
    effectModel: {
      baseEffect: 1.1,
      factorModifiers: {
        weather_rain: -0.1,
        weather_fog: -0.1,
        truck_ratio_high: 0.0,
        road_congested: 0.15,
        inflow_high: 0.1,
      },
    },
    historicalData: {
      executionCount: 32,
      successRate: 0.83,
      avgReliefMinutes: 26,
    },
  },
  'S-05': {
    id: 'S-05',
    name: '全面管控 → 多路分流 + 临时停车',
    permission: 'approve' as StrategyPermission,
    permissionLabel: '🔴 需审批',
    effect: '7.0 → 4.5',
    time: '约 45 分钟',
    reduce: '~320 辆',
    difficulty: 3,
    effectTime: '15 分钟生效',
    risk: '需跨部门协同（交通+公安+应急），影响范围广',
    triggerCondition: '主通道阻断或大范围低速持续 15 分钟以上',
    reasonTemplate: '进港大道-徐海路全段大范围低速，启用全面管控：多路分流 + 临时停车 + 应急资源调度。',
    requiredResources: [
      { type: 'police', quantity: 8, estimatedArrivalMin: 10 },
      { type: 'cone', quantity: 50, estimatedArrivalMin: 12 },
      { type: 'led_screen', quantity: 5, estimatedArrivalMin: 15 },
    ],
    effectModel: {
      baseEffect: 1.6,
      factorModifiers: {
        weather_rain: -0.15,
        weather_fog: -0.1,
        truck_ratio_high: -0.05,
        road_congested: 0.2,
        inflow_high: 0.15,
      },
    },
    historicalData: {
      executionCount: 12,
      successRate: 0.81,
      avgReliefMinutes: 38,
    },
  },
  'S-07': {
    id: 'S-07',
    name: '远端拦截分流（待踏勘确认）',
    permission: 'confirm' as StrategyPermission,
    permissionLabel: '🟡 需确认',
    effect: '6.5 → 5.0',
    time: '约 30 分钟',
    reduce: '~220 辆',
    difficulty: 2,
    effectTime: '10 分钟生效',
    risk: '需上游路口具备分流条件，待现场踏勘确认',
    triggerCondition: '早到车流大量累积，主路压力即将外溢',
    reasonTemplate: '检测到早到车流压力达到{earlyArrivalPressure}，建议在上游路口提前分流，避免主路压力进一步累积。',
    requiredResources: [
      { type: 'police', quantity: 3, estimatedArrivalMin: 8 },
      { type: 'cone', quantity: 15, estimatedArrivalMin: 10 },
      { type: 'led_screen', quantity: 2, estimatedArrivalMin: 10 },
    ],
    effectModel: {
      baseEffect: 1.0,
      factorModifiers: {
        weather_rain: -0.1,
        weather_fog: -0.1,
        truck_ratio_high: 0.0,
        road_congested: 0.1,
        inflow_high: 0.2,
      },
    },
    historicalData: {
      executionCount: 18,
      successRate: 0.78,
      avgReliefMinutes: 30,
    },
  },
  'S-09': {
    id: 'S-09',
    name: '诱导屏信息发布（配套措施）',
    permission: 'auto' as StrategyPermission,
    permissionLabel: '🟢 自动执行',
    effect: '分流5-10%',
    time: '即时',
    reduce: '~50 辆',
    difficulty: 0,
    effectTime: '即时生效',
    risk: '配套措施，通常随分流策略联动启用，效果依赖驾驶员配合',
    triggerCondition: '任意分流策略执行时自动联动，或独立发布预警提示',
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

// Cause → applicable strategy IDs (post construction-plan alignment)
// All strategies organized around main-road → alternative-road diversion model
const CAUSE_STRATEGY_MAP: Record<CongestionCauseType, string[]> = {
  port_backlog: ['S-01', 'S-02', 'S-05'],   // 应急车道借用 + S376分流 + 全面管控
  traffic_peak: ['S-04', 'S-09', 'S-07'],   // 徐海路-环半岛公路分流 + 诱导屏 + 远端拦截
  accident: ['S-02', 'S-04'],               // 主路事故时启用 S376 或 环半岛公路分流
  weather: ['S-09', 'S-07'],                // 恶劣天气下发诱导屏 + 远端拦截
  construction: ['S-02', 'S-04'],           // 施工占道时启用替代路分流
  compound: [],                              // compound inherits from its sub-causes
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
