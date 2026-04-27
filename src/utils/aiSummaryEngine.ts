import type {
  AiSummary,
  PortDigestion,
  TidalEffect,
  CorridorPressureItem,
  SystemResilience,
  ShutdownProbability,
  UrbanHealth,
  PressureTransmission,
  WeatherCoupling,
  SpecialEvent,
} from '../stores/overviewStore';

interface OverviewIndicators {
  portDigestion: PortDigestion;
  tidalEffect: TidalEffect;
  corridorPressure: CorridorPressureItem[];
  systemResilience: SystemResilience;
  shutdownProbability: ShutdownProbability;
  urbanHealth: UrbanHealth;
  pressureTransmission: PressureTransmission;
  weatherCoupling: WeatherCoupling;
  specialEvents: SpecialEvent[];
  inboundFlow: number;
  outboundFlow: number;
  violationCount: number;
}

type AlertLevel = 'green' | 'yellow' | 'orange' | 'red';

export function computeAiSummary(indicators: OverviewIndicators): AiSummary {
  const { specialEvents } = indicators;

  // 1. 计算整体告警等级
  const level = computeAlertLevel(indicators);

  // 2. 生成一句话结论
  const conclusion = generateConclusion(indicators, level);

  // 3. 生成建议提示
  const suggestionHint = generateSuggestionHint(indicators, level);

  // 4. 生成徽章
  const badges = generateBadges(indicators);

  // 5. 生成展开标题
  const headerTitle = generateHeaderTitle(indicators, specialEvents);

  // 6. 生成关键指标
  const metrics = generateMetrics(indicators);

  // 7. 生成预测
  const forecasts = generateForecasts(indicators);

  // 8. 生成建议操作
  const actions = generateActions(indicators, level);

  // 9. 生成对比数据（节假日模式）
  const compares = generateCompares(indicators, specialEvents);
  const compareConclusion = generateCompareConclusion(specialEvents);

  // v2.0: Generate risk forecast
  const riskForecast = {
    next30min: level === 'red' ? 'high' : level === 'orange' ? 'medium' : 'low',
    next1hour: level === 'red' || level === 'orange' ? 'medium' : 'low',
  } as const;

  // v2.0: Generate prediction confidence (mock: 75-95%)
  const predictionConfidence = Math.floor(75 + Math.random() * 20);

  return {
    level,
    conclusion,
    suggestionHint,
    badges,
    headerTitle,
    metrics,
    forecasts,
    actions,
    compares,
    compareConclusion,
    expanded: false,
    // v2.0 new fields
    riskForecast,
    predictionConfidence,
    // Phase 2 fields (empty for now)
    influenceFactors: undefined,
    similarCases: undefined,
    learningStats: undefined,
  };
}

function computeAlertLevel(indicators: OverviewIndicators): AlertLevel {
  const {
    portDigestion,
    corridorPressure,
    systemResilience,
    urbanHealth,
    pressureTransmission,
    weatherCoupling,
  } = indicators;

  // 红色：任一关键指标严重异常
  if (
    portDigestion.digestionMinutes > 360 || // 消化时间 > 6h
    corridorPressure.some((c) => c.pressure >= 95) || // 任一通道 >= 95%
    systemResilience.score < 30 || // 韧性 < 30
    urbanHealth.score < 40 || // 城区健康度 < 40
    pressureTransmission.overallStatus === 'citywide' || // 压力传导全城
    weatherCoupling.overallScore >= 80 // 气象耦合度 >= 80
  ) {
    return 'red';
  }

  // 橙色：多个指标中度异常
  if (
    portDigestion.digestionMinutes > 240 || // 消化时间 > 4h
    corridorPressure.some((c) => c.pressure >= 85) || // 任一通道 >= 85%
    systemResilience.score < 40 || // 韧性 < 40
    urbanHealth.score < 50 || // 城区健康度 < 50
    pressureTransmission.overallStatus === 'spreading' || // 压力传导扩散
    weatherCoupling.overallScore >= 60 // 气象耦合度 >= 60
  ) {
    return 'orange';
  }

  // 黄色：单个指标轻度异常
  if (
    portDigestion.digestionMinutes > 120 || // 消化时间 > 2h
    corridorPressure.some((c) => c.pressure >= 75) || // 任一通道 >= 75%
    systemResilience.score < 50 || // 韧性 < 50
    urbanHealth.score < 60 || // 城区健康度 < 60
    pressureTransmission.overallStatus === 'transmitting' || // 压力传导中
    weatherCoupling.overallScore >= 40 // 气象耦合度 >= 40
  ) {
    return 'yellow';
  }

  // 绿色：正常
  return 'green';
}

function generateConclusion(indicators: OverviewIndicators, level: AlertLevel): string {
  const { portDigestion, corridorPressure, systemResilience, specialEvents } = indicators;

  // 节假日模式
  const holiday = specialEvents.find((e) => e.isHoliday);
  if (holiday) {
    if (level === 'green') return '正常高峰';
    if (level === 'yellow') return '正常高峰 · 需关注';
    if (level === 'orange') return '高峰压力较大';
    return '高峰压力严重';
  }

  // 日常模式
  if (level === 'green') return '交通态势正常';
  if (level === 'yellow') {
    if (portDigestion.digestionMinutes > 120) return '港口消化缓慢';
    if (corridorPressure.some((c) => c.pressure >= 75)) return '通道压力上升';
    if (systemResilience.score < 50) return '应急韧性偏弱';
    return '需关注态势';
  }
  if (level === 'orange') {
    if (portDigestion.digestionMinutes > 240) return '港口积压严重';
    if (corridorPressure.some((c) => c.pressure >= 85)) return '通道接近饱和';
    return '压力较大';
  }
  // red
  if (portDigestion.digestionMinutes > 360) return '港口严重积压';
  if (corridorPressure.some((c) => c.pressure >= 95)) return '通道严重拥堵';
  return '态势严峻';
}

function generateSuggestionHint(indicators: OverviewIndicators, level: AlertLevel): string {
  const { portDigestion, corridorPressure, systemResilience } = indicators;

  if (level === 'green') return '无需干预';

  // 找到最高压力的通道
  const maxPressure = Math.max(...corridorPressure.map((c) => c.pressure));
  const maxCorridor = corridorPressure.find((c) => c.pressure === maxPressure);

  if (maxPressure >= 85) {
    return `建议启动 ${maxCorridor?.name} 分流`;
  }

  if (portDigestion.digestionMinutes > 240) {
    return '建议协调港口增开班次';
  }

  if (systemResilience.score < 40) {
    return '建议增派应急力量';
  }

  return '建议持续关注';
}

function generateBadges(indicators: OverviewIndicators) {
  const { inboundFlow, outboundFlow, portDigestion, systemResilience } = indicators;
  const totalFlow = inboundFlow + outboundFlow;

  return [
    { label: `车流 ${(totalFlow / 10000).toFixed(1)}万`, type: 'flow' as const },
    { label: `港口等${portDigestion.waitingVehicles}`, type: 'port' as const },
    { label: `韧性 ${systemResilience.score}`, type: 'resilience' as const },
  ];
}

function generateHeaderTitle(_indicators: OverviewIndicators, specialEvents: SpecialEvent[]): string {
  const holiday = specialEvents.find((e) => e.isHoliday);
  if (holiday) {
    const { type, baselineMultiplier } = holiday;
    return `${type} · 车流量为日常 ${baselineMultiplier}x`;
  }
  return '日常态势监控';
}

function generateMetrics(indicators: OverviewIndicators) {
  const { inboundFlow, outboundFlow, portDigestion, corridorPressure, systemResilience, specialEvents } = indicators;
  const totalFlow = inboundFlow + outboundFlow;
  const maxPressure = Math.max(...corridorPressure.map((c) => c.pressure));
  const maxCorridor = corridorPressure.find((c) => c.pressure === maxPressure);

  const holiday = specialEvents.find((e) => e.isHoliday);
  const flowTag = holiday ? `${holiday.baselineMultiplier}x` : undefined;

  return [
    {
      value: totalFlow.toLocaleString(),
      label: '今日车流',
      color: '#00D0E9',
      tag: flowTag,
      tagType: 'neutral' as const,
    },
    {
      value: portDigestion.waitingVehicles.toLocaleString(),
      label: '港口等待(辆)',
      color: portDigestion.digestionMinutes > 240 ? '#FF6B35' : '#F5A623',
      tag: `↑ ${Math.floor(portDigestion.digestionMinutes / 60)}h${portDigestion.digestionMinutes % 60}m`,
      tagType: 'up' as const,
    },
    {
      value: `${maxPressure}%`,
      label: `${maxCorridor?.name}压力`,
      color: maxPressure >= 85 ? '#FF6B35' : maxPressure >= 75 ? '#F5A623' : '#00D0E9',
    },
    {
      value: systemResilience.score.toString(),
      label: '应急韧性',
      color: systemResilience.score < 40 ? '#FF6B35' : systemResilience.score < 50 ? '#F5A623' : '#2ED573',
      tag: systemResilience.score < 50 ? '薄弱' : undefined,
      tagType: systemResilience.score < 50 ? ('up' as const) : undefined,
    },
  ];
}

function generateForecasts(indicators: OverviewIndicators) {
  const { portDigestion, corridorPressure, systemResilience } = indicators;
  const forecasts = [];

  const maxPressure = Math.max(...corridorPressure.map((c) => c.pressure));

  if (maxPressure >= 80) {
    forecasts.push({
      time: '未来 30 分钟',
      text: '通道压力持续上升，建议提前启动分流',
      level: 'warn' as const,
    });
  }

  if (portDigestion.digestionMinutes > 240) {
    forecasts.push({
      time: '未来 1 小时',
      text: '港口积压预计加剧，消化时间可能超过 6 小时',
      level: 'danger' as const,
    });
  }

  if (systemResilience.score < 40) {
    forecasts.push({
      time: '当前',
      text: '应急韧性偏低，建议增派应急力量',
      level: 'warn' as const,
    });
  }

  if (forecasts.length === 0) {
    forecasts.push({
      time: '未来 2 小时',
      text: '态势平稳，无明显异常',
      level: 'info' as const,
    });
  }

  return forecasts;
}

function generateActions(indicators: OverviewIndicators, _level: AlertLevel) {
  const { portDigestion, corridorPressure, systemResilience } = indicators;
  const actions = [];

  const maxPressure = Math.max(...corridorPressure.map((c) => c.pressure));
  const maxCorridor = corridorPressure.find((c) => c.pressure === maxPressure);

  if (maxPressure >= 75) {
    actions.push({
      title: `启动 ${maxCorridor?.name} 分流`,
      description: `当前压力 ${maxPressure}%，建议启动分流策略`,
      priority: maxPressure >= 85 ? ('high' as const) : ('medium' as const),
      mode: 'command',
    });
  }

  if (portDigestion.digestionMinutes > 240) {
    actions.push({
      title: '协调港口增开班次',
      description: `当前消化时间 ${Math.floor(portDigestion.digestionMinutes / 60)}h，建议增开`,
      priority: 'high' as const,
      action: 'port',
    });
  }

  if (systemResilience.score < 40) {
    actions.push({
      title: '增派应急力量',
      description: `韧性评分 ${systemResilience.score}，建议增派警力和拖车`,
      priority: 'medium' as const,
      action: 'resource',
    });
  }

  if (actions.length === 0) {
    actions.push({
      title: '持续监控态势',
      description: '当前态势正常，保持关注',
      priority: 'low' as const,
      action: 'monitor',
    });
  }

  return actions;
}

function generateCompares(indicators: OverviewIndicators, specialEvents: SpecialEvent[]) {
  const holiday = specialEvents.find((e) => e.isHoliday);
  if (!holiday) return [];

  const { portDigestion, corridorPressure } = indicators;
  const maxPressure = Math.max(...corridorPressure.map((c) => c.pressure));
  const multiplier = holiday.baselineMultiplier ?? 1;

  return [
    { label: '车流量', value: `+${((multiplier - 1) * 100).toFixed(0)}% ↑`, good: false },
    { label: '港口消化', value: portDigestion.digestionMinutes > 240 ? '-15% ↓' : '+8% ↑', good: portDigestion.digestionMinutes <= 240 },
    { label: '通道压力', value: maxPressure > 80 ? '+12% ↑' : '+3% ↑', good: maxPressure <= 80 },
  ];
}

function generateCompareConclusion(specialEvents: SpecialEvent[]): string {
  const holiday = specialEvents.find((e) => e.isHoliday);
  if (holiday) return '整体符合节假日预期';
  return '整体优于去年';
}
