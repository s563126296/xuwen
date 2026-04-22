/**
 * AI 分析体系 Mock 数据
 *
 * 包含四类分析要素：
 * 1. 问题检测（Problem Detection）- 当前已发生的交通异常
 * 2. 风险预警（Risk Warning）- 未来可能发生的交通风险
 * 3. 趋势预测（Trend Prediction）- 基于历史和实时数据的趋势预测
 * 4. 因果推理（Causal Reasoning）- 交通问题的因果关系链分析
 */

// ==================== 类型定义 ====================

/** 分析要素基础类型 */
export interface AnalysisElement {
  id: string;
  type: 'problem' | 'risk' | 'prediction' | 'causal';
  category: string;
  name: string;
  location: { lng: number; lat: number };
  confidence?: number;
  detectedAt?: string;
  predictedAt?: string;
}

/** 问题检测 */
export interface ProblemDetection extends AnalysisElement {
  type: 'problem';
  severity: 'critical' | 'high' | 'medium';
  value: string;
  metrics: Record<string, string | number>;
  cause: string;
  impact: string;
}

/** 风险预警 */
export interface RiskWarning extends AnalysisElement {
  type: 'risk';
  level: 'critical' | 'high' | 'medium';
  metrics: Record<string, string | number>;
  trigger: string;
  mitigation: string;
}

/** 趋势预测项 */
export interface PredictionItem {
  metric: string;
  current: number;
  predicted: number;
  trend: 'up' | 'down' | 'stable';
  change: string;
  confidenceRange: [number, number];
}

/** 趋势预测 */
export interface TrendPrediction extends AnalysisElement {
  type: 'prediction';
  timeHorizon: string;
  predictions: PredictionItem[];
  basis: string;
}

/** 因果链节点 */
export interface CausalNode {
  node: string;
  role: 'root_cause' | 'intermediate' | 'outcome';
  contribution: number;
  timeLag?: string;
  metrics: Record<string, string | number>;
}

/** 因果推理 */
export interface CausalReasoning extends AnalysisElement {
  type: 'causal';
  chain: CausalNode[];
}

// ==================== Mock 数据 ====================

/** 问题检测数据 */
const problems: ProblemDetection[] = [
  {
    id: 'problem-port-001',
    type: 'problem',
    category: '港口积压',
    name: '港口待渡车辆积压',
    severity: 'critical',
    location: { lng: 110.096, lat: 20.226 },
    value: '2847辆',
    metrics: {
      waitingVehicles: 2847,
      avgWaitTime: '3.5小时',
      queueLength: '4.2km',
      parkingOccupancy: '96%',
      releaseRate: '258辆/小时',
      normalReleaseRate: '450辆/小时',
    },
    cause: '海况不佳，航班减少至8班/小时，港口放行速度降至258辆/小时',
    impact: '进港大道回堵3.2km，城区主干道拥堵指数升至2.3',
    detectedAt: '2026-04-22 14:23:15',
    confidence: 0.96,
  },
  {
    id: 'problem-road-001',
    type: 'problem',
    category: '道路拥堵',
    name: '进港大道严重拥堵',
    severity: 'critical',
    location: { lng: 110.152, lat: 20.260 },
    value: '拥堵指数3.2',
    metrics: {
      congestionIndex: 3.2,
      avgSpeed: '12km/h',
      normalSpeed: '60km/h',
      jamLength: '3.2km',
      travelTime: '48分钟',
      normalTravelTime: '15分钟',
    },
    cause: '港口积压车辆回堵，待渡车辆排队延伸至进港大道',
    impact: '进港通行时间从15分钟延长至48分钟，影响约1200辆在途车辆',
    detectedAt: '2026-04-22 14:28:42',
    confidence: 0.94,
  },
  {
    id: 'problem-road-002',
    type: 'problem',
    category: '道路拥堵',
    name: '城区主干道拥堵',
    severity: 'high',
    location: { lng: 110.183, lat: 20.322 },
    value: '拥堵指数2.3',
    metrics: {
      congestionIndex: 2.3,
      avgSpeed: '18km/h',
      normalSpeed: '40km/h',
      affectedRoads: 4,
      affectedIntersections: 7,
      queueOverflow: '680m',
    },
    cause: '进港大道拥堵传导至城区，叠加下午出行高峰',
    impact: '城区核心区域7个路口排队溢出，公交线路延误15-20分钟',
    detectedAt: '2026-04-22 14:35:08',
    confidence: 0.91,
  },
];

/** 风险预警数据 */
const risks: RiskWarning[] = [
  {
    id: 'risk-port-001',
    type: 'risk',
    category: '港口运力风险',
    name: '港口运力不足风险',
    level: 'high',
    location: { lng: 110.096, lat: 20.226 },
    predictedAt: '2026-04-22 16:30:00',
    confidence: 0.82,
    metrics: {
      predictedWaitingVehicles: 3200,
      predictedWaitTime: '4.5小时',
      currentTrend: '上升15%/小时',
      inboundRate: '420辆/小时',
      outboundRate: '258辆/小时',
      deficit: '162辆/小时',
    },
    trigger: '当前待渡车辆2847辆，进港速度420辆/小时，放行速度258辆/小时，缺口162辆/小时',
    mitigation: '建议启动S376分流方案，引导部分车辆至海安新港，预计可分流120辆/小时',
  },
  {
    id: 'risk-weather-001',
    type: 'risk',
    category: '极端天气风险',
    name: '海况恶化风险',
    level: 'high',
    location: { lng: 110.096, lat: 20.226 },
    predictedAt: '2026-04-22 18:00:00',
    confidence: 0.76,
    metrics: {
      predictedWindForce: '7-8级',
      currentWindForce: '5级',
      predictedWaveHeight: '2.5m',
      currentWaveHeight: '1.2m',
      affectedFlights: '可能停航',
    },
    trigger: '气象部门预报琼州海峡未来4小时风力增强至7-8级，浪高2.5m',
    mitigation: '建议提前发布停航预警，启动应急疏导预案，通知在途车辆就近停靠',
  },
];

/** 趋势预测数据 */
const predictions: TrendPrediction[] = [
  {
    id: 'prediction-short-001',
    type: 'prediction',
    category: '短期预测',
    name: '45分钟交通趋势预测',
    timeHorizon: '45min',
    location: { lng: 110.152, lat: 20.260 },
    confidence: 0.85,
    predictions: [
      {
        metric: '港口待渡车辆',
        current: 2847,
        predicted: 3150,
        trend: 'up',
        change: '+10.6%',
        confidenceRange: [2980, 3320],
      },
      {
        metric: '进港大道拥堵指数',
        current: 3.2,
        predicted: 2.8,
        trend: 'down',
        change: '-12.5%',
        confidenceRange: [2.6, 3.0],
      },
      {
        metric: '城区拥堵指数',
        current: 2.3,
        predicted: 2.1,
        trend: 'down',
        change: '-8.7%',
        confidenceRange: [1.9, 2.3],
      },
      {
        metric: '港口放行速度',
        current: 258,
        predicted: 320,
        trend: 'up',
        change: '+24.0%',
        confidenceRange: [290, 350],
      },
    ],
    basis: '基于当前港口放行速度提升至320辆/小时（新增2个检票通道），进港速度下降至380辆/小时（信号灯调控生效）',
    detectedAt: '2026-04-22 14:45:00',
  },
];

/** 因果推理数据 */
const causalChains: CausalReasoning[] = [
  {
    id: 'causal-chain-001',
    type: 'causal',
    category: '港城传导链',
    name: '港口积压到城区拥堵传导分析',
    location: { lng: 110.140, lat: 20.280 },
    confidence: 0.88,
    chain: [
      {
        node: '港口放行速度下降',
        role: 'root_cause',
        contribution: 0.68,
        timeLag: '15-25分钟',
        metrics: { current: '258辆/小时', normal: '450辆/小时', decline: '42.7%' },
      },
      {
        node: '港口待渡车辆积压',
        role: 'intermediate',
        contribution: 0.82,
        timeLag: '10-15分钟',
        metrics: { current: '2847辆', threshold: '1500辆', excess: '89.8%' },
      },
      {
        node: '进港大道回堵',
        role: 'intermediate',
        contribution: 0.56,
        timeLag: '20-30分钟',
        metrics: { jamLength: '3.2km', congestionIndex: 3.2, speedDrop: '80%' },
      },
      {
        node: '城区主干道拥堵',
        role: 'outcome',
        contribution: 0.42,
        timeLag: '15-20分钟',
        metrics: { congestionIndex: 2.3, affectedIntersections: 7 },
      },
    ],
    detectedAt: '2026-04-22 14:40:00',
  },
];

// ==================== 导出函数 ====================

/** 返回所有问题检测 */
export function getAllProblems(): ProblemDetection[] {
  return [...problems];
}

/** 返回所有风险预警 */
export function getAllRisks(): RiskWarning[] {
  return [...risks];
}

/** 返回所有趋势预测 */
export function getAllPredictions(): TrendPrediction[] {
  return [...predictions];
}

/** 返回所有因果推理 */
export function getAllCausalChains(): CausalReasoning[] {
  return [...causalChains];
}

/** 严重程度排序权重 */
const severityOrder: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
};

/** 返回所有分析要素（按严重程度排序） */
export function getAllElements(): AnalysisElement[] {
  const all: AnalysisElement[] = [
    ...problems,
    ...risks,
    ...predictions,
    ...causalChains,
  ];

  return all.sort((a, b) => {
    const getSeverity = (el: AnalysisElement): string => {
      if ('severity' in el) return (el as ProblemDetection).severity;
      if ('level' in el) return (el as RiskWarning).level;
      return 'medium';
    };
    return (severityOrder[getSeverity(a)] ?? 9) - (severityOrder[getSeverity(b)] ?? 9);
  });
}
