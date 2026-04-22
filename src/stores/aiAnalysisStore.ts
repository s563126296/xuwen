import { create } from 'zustand';

// 热力矩阵单元格
export interface HeatmapCell {
  hour: number;
  day: number;
  value: number; // 拥堵指数 0-3
  label: string;
}

// 预测曲线点
export interface PredictionPoint {
  time: string;
  current: number;
  predicted: number;
  confidence: number;
}

// 相关性洞察
export interface CorrelationInsight {
  id: string;
  factor1: string;
  factor2: string;
  correlation: number; // -1 到 1
  description: string;
  strength: 'strong' | 'medium' | 'weak';
}

// 活跃预警
export interface ActiveAlert {
  id: string;
  type: 'congestion' | 'accident' | 'weather' | 'capacity';
  level: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  message: string;
  time: string;
  confidence: number;
}

// 预警历史项
export interface AlertHistoryItem {
  time: string;
  count: number;
  level: 'critical' | 'high' | 'medium' | 'low';
}

// 风险传导节点
export interface PropagationNode {
  id: string;
  name: string;
  type: 'port' | 'road' | 'intersection' | 'area';
  riskLevel: number; // 0-100
  connections: string[]; // 连接的节点ID
}

// AI推荐策略
export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  confidence: number;
  impact: number; // 预期影响 0-100
  priority: 'high' | 'medium' | 'low';
}

// 备选策略
export interface Strategy {
  id: string;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  effectiveness: number; // 0-100
  cost: number; // 0-100
}

// 健康雷达维度
export interface RadarDimension {
  dimension: string;
  value: number; // 0-100
  threshold: number;
}

// 港口-城区联动趋势点
export interface PortCityPoint {
  time: string;
  portPressure: number;
  cityPressure: number;
}

// 当前态势指标
export interface CurrentStateMetrics {
  congestionIndex: number;
  portQueue: number;
  cityFlow: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// 推演步骤
export interface ReasoningStep {
  id: string;
  step: string;
  description: string;
  confidence: number;
  status: 'completed' | 'running' | 'pending';
}

// 决策建议
export interface DecisionRecommendation {
  id: string;
  title: string;
  description: string;
  confidence: number;
  impact: string;
  risk: string;
}

export interface AIAnalysisState {
  // 模式控制
  viewMode: 'realtime' | 'history' | 'prediction';
  historyTimestamp: string | null;

  // 象限A：洞察数据
  heatmapData: HeatmapCell[][];
  predictionCurve: PredictionPoint[];
  correlationInsights: CorrelationInsight[];

  // 象限B：预警数据
  riskScore: number;
  activeAlerts: ActiveAlert[];
  alertHistory: AlertHistoryItem[];
  riskPropagation: PropagationNode[];

  // 象限C：决策数据
  topRecommendation: AIRecommendation;
  alternativeStrategies: Strategy[];

  // 象限D：态势数据
  healthRadar: RadarDimension[];
  portCityTrend: PortCityPoint[];

  // 中央推演沙盘
  currentState: CurrentStateMetrics;
  reasoningProcess: ReasoningStep[];
  recommendations: DecisionRecommendation[];

  // 联动状态
  selectedTimeCell: { day: number; hour: number } | null;
  selectedAlert: string | null;

  // AI状态
  aiStatus: 'running' | 'completed' | 'error';
  aiTask: string;
  aiConfidence: number;
  dataFusion: {
    traffic: boolean;
    weather: boolean;
    port: boolean;
    video: boolean;
    social: boolean;
    history: boolean;
    prediction: boolean;
  };
  lastUpdate: string;

  // 时间轴控制
  isPlaying: boolean;
  playbackSpeed: number;
  timelineProgress: number;

  // Actions
  setViewMode: (mode: 'realtime' | 'history' | 'prediction') => void;
  selectTimeCell: (cell: { day: number; hour: number } | null) => void;
  selectAlert: (id: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setTimelineProgress: (progress: number) => void;
}

// Mock 数据生成
const generateHeatmapData = (): HeatmapCell[][] => {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return days.map((day, dayIndex) =>
    hours.map(hour => {
      // 模拟早晚高峰
      let value = 0.5;
      if (hour >= 7 && hour <= 9) value = 2.2 + Math.random() * 0.6;
      else if (hour >= 17 && hour <= 19) value = 2.4 + Math.random() * 0.5;
      else if (hour >= 10 && hour <= 16) value = 1.2 + Math.random() * 0.4;
      else value = 0.3 + Math.random() * 0.3;

      // 周末略低
      if (dayIndex >= 5) value *= 0.85;

      return {
        hour,
        day: dayIndex,
        value: Math.min(3, value),
        label: `${day} ${hour}:00`,
      };
    })
  );
};

const mockPredictionCurve: PredictionPoint[] = Array.from({ length: 48 }, (_, i) => {
  const time = `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`;
  const hour = Math.floor(i / 2);
  let base = 1.0;
  if (hour >= 7 && hour <= 9) base = 2.3;
  else if (hour >= 17 && hour <= 19) base = 2.5;
  else if (hour >= 10 && hour <= 16) base = 1.5;

  const current = i < 28 ? base + (Math.random() - 0.5) * 0.3 : undefined;
  const predicted = base + (Math.random() - 0.5) * 0.2;

  return {
    time,
    current: current || 0,
    predicted,
    confidence: 95 - i * 0.5,
  };
});

const mockCorrelationInsights: CorrelationInsight[] = [
  {
    id: 'c1',
    factor1: '港口待渡车辆',
    factor2: '进港大道拥堵',
    correlation: 0.87,
    description: '港口待渡车辆每增加100辆，进港大道拥堵指数上升0.15',
    strength: 'strong',
  },
  {
    id: 'c2',
    factor1: '天气降雨',
    factor2: '通行速度',
    correlation: -0.72,
    description: '降雨量每增加10mm，平均通行速度下降18%',
    strength: 'strong',
  },
  {
    id: 'c3',
    factor1: '节假日',
    factor2: '跨海客流',
    correlation: 0.65,
    description: '节假日前3天跨海客流量平均增长42%',
    strength: 'medium',
  },
  {
    id: 'c4',
    factor1: '城区拥堵',
    factor2: '港口疏散效率',
    correlation: -0.58,
    description: '城区拥堵指数每上升1.0，港口疏散效率下降12%',
    strength: 'medium',
  },
];

const mockActiveAlerts: ActiveAlert[] = [
  {
    id: 'a1',
    type: 'congestion',
    level: 'critical',
    location: '进港大道K3+500',
    message: '拥堵指数2.8，排队长度3.2km，预计持续45分钟',
    time: '14:23',
    confidence: 92,
  },
  {
    id: 'a2',
    type: 'capacity',
    level: 'high',
    location: '徐闻港',
    message: '待渡车辆2847辆，超过黄色阈值14%',
    time: '14:18',
    confidence: 88,
  },
  {
    id: 'a3',
    type: 'weather',
    level: 'medium',
    location: '琼州海峡',
    message: '2小时后可能出现阵雨，能见度下降至800米',
    time: '14:05',
    confidence: 75,
  },
];

const mockAlertHistory: AlertHistoryItem[] = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, '0')}:00`,
  count: Math.floor(Math.random() * 8) + (i >= 7 && i <= 9 || i >= 17 && i <= 19 ? 5 : 0),
  level: (i >= 17 && i <= 19 ? 'high' : i >= 7 && i <= 9 ? 'medium' : 'low') as 'critical' | 'high' | 'medium' | 'low',
}));

const mockRiskPropagation: PropagationNode[] = [
  { id: 'n1', name: '徐闻港', type: 'port', riskLevel: 85, connections: ['n2'] },
  { id: 'n2', name: '进港大道', type: 'road', riskLevel: 78, connections: ['n1', 'n3', 'n4'] },
  { id: 'n3', name: '城区主干道', type: 'road', riskLevel: 65, connections: ['n2', 'n5'] },
  { id: 'n4', name: 'S376分流路线', type: 'road', riskLevel: 42, connections: ['n2'] },
  { id: 'n5', name: '城区核心区', type: 'area', riskLevel: 58, connections: ['n3'] },
];

const mockTopRecommendation: AIRecommendation = {
  id: 'r1',
  title: '启动S376分流方案',
  description: '建议立即启动S376分流路线，预计可分流30%进港车辆，降低进港大道压力',
  confidence: 88,
  impact: 85,
  priority: 'high',
};

const mockAlternativeStrategies: Strategy[] = [
  {
    id: 's1',
    name: '信号配时优化',
    description: '调整进港大道沿线信号灯配时，提升南向绿信比',
    pros: ['实施快速', '成本低', '可立即生效'],
    cons: ['效果有限', '可能影响横向道路'],
    effectiveness: 65,
    cost: 20,
  },
  {
    id: 's2',
    name: '港口运力提升',
    description: '协调港口增加船舶班次，加快车辆疏散',
    pros: ['根本解决', '效果显著'],
    cons: ['需跨部门协调', '受天气影响'],
    effectiveness: 90,
    cost: 75,
  },
  {
    id: 's3',
    name: '临时交通管制',
    description: '对部分路段实施临时管制，引导车辆绕行',
    pros: ['快速见效', '可控性强'],
    cons: ['影响范围大', '可能引发投诉'],
    effectiveness: 70,
    cost: 60,
  },
];

const mockHealthRadar: RadarDimension[] = [
  { dimension: '通行效率', value: 68, threshold: 70 },
  { dimension: '港口运力', value: 72, threshold: 75 },
  { dimension: '城区流畅度', value: 75, threshold: 70 },
  { dimension: '安全指数', value: 88, threshold: 85 },
  { dimension: '应急响应', value: 92, threshold: 80 },
  { dimension: '服务质量', value: 81, threshold: 75 },
];

const mockPortCityTrend: PortCityPoint[] = Array.from({ length: 24 }, (_, i) => {
  const hour = i;
  let portBase = 50;
  let cityBase = 50;

  if (hour >= 7 && hour <= 9) {
    portBase = 85;
    cityBase = 75;
  } else if (hour >= 17 && hour <= 19) {
    portBase = 90;
    cityBase = 82;
  } else if (hour >= 10 && hour <= 16) {
    portBase = 65;
    cityBase = 60;
  }

  return {
    time: `${String(hour).padStart(2, '0')}:00`,
    portPressure: portBase + (Math.random() - 0.5) * 10,
    cityPressure: cityBase + (Math.random() - 0.5) * 8,
  };
});

const mockCurrentState: CurrentStateMetrics = {
  congestionIndex: 2.31,
  portQueue: 2847,
  cityFlow: 4523,
  riskLevel: 'high',
};

const mockReasoningProcess: ReasoningStep[] = [
  {
    id: 'step1',
    step: '数据融合',
    description: '整合7类数据源，完成实时态势感知',
    confidence: 98,
    status: 'completed',
  },
  {
    id: 'step2',
    step: '因果分析',
    description: '识别港口释放为主要成因，置信度87%',
    confidence: 87,
    status: 'completed',
  },
  {
    id: 'step3',
    step: '趋势预测',
    description: '预测未来45分钟拥堵指数峰值2.45',
    confidence: 83,
    status: 'running',
  },
  {
    id: 'step4',
    step: '方案推演',
    description: '评估3种干预方案的效果与风险',
    confidence: 0,
    status: 'pending',
  },
];

const mockRecommendations: DecisionRecommendation[] = [
  {
    id: 'rec1',
    title: '启动S376分流',
    description: '立即启动S376分流路线，预计分流30%车辆',
    confidence: 88,
    impact: '拥堵指数下降0.6-0.8，排队长度缩短1.2km',
    risk: '分流比例过高可能导致S376局部压力',
  },
  {
    id: 'rec2',
    title: '优化信号配时',
    description: '提升进港大道南向绿信比至65%',
    confidence: 82,
    impact: '通行效率提升12-18%，峰值延后15分钟',
    risk: '横向道路可能出现排队，需同步监控',
  },
  {
    id: 'rec3',
    title: '协调港口运力',
    description: '建议港口增加2个班次，加快车辆疏散',
    confidence: 75,
    impact: '待渡车辆消化速度提升25%',
    risk: '依赖海峡天气窗口，存在不确定性',
  },
];

export const useAIAnalysisStore = create<AIAnalysisState>((set) => ({
  // 模式控制
  viewMode: 'realtime',
  historyTimestamp: null,

  // 象限A：洞察数据
  heatmapData: generateHeatmapData(),
  predictionCurve: mockPredictionCurve,
  correlationInsights: mockCorrelationInsights,

  // 象限B：预警数据
  riskScore: 78,
  activeAlerts: mockActiveAlerts,
  alertHistory: mockAlertHistory,
  riskPropagation: mockRiskPropagation,

  // 象限C：决策数据
  topRecommendation: mockTopRecommendation,
  alternativeStrategies: mockAlternativeStrategies,

  // 象限D：态势数据
  healthRadar: mockHealthRadar,
  portCityTrend: mockPortCityTrend,

  // 中央推演沙盘
  currentState: mockCurrentState,
  reasoningProcess: mockReasoningProcess,
  recommendations: mockRecommendations,

  // 联动状态
  selectedTimeCell: null,
  selectedAlert: null,

  // AI状态
  aiStatus: 'running',
  aiTask: '正在分析港口-城区交通态势并生成决策建议',
  aiConfidence: 85,
  dataFusion: {
    traffic: true,
    weather: true,
    port: true,
    video: true,
    social: false,
    history: true,
    prediction: true,
  },
  lastUpdate: '14:23:45',

  // 时间轴控制
  isPlaying: false,
  playbackSpeed: 1,
  timelineProgress: 65,

  // Actions
  setViewMode: (mode) => set({ viewMode: mode }),
  selectTimeCell: (cell) => set({ selectedTimeCell: cell }),
  selectAlert: (id) => set({ selectedAlert: id }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setTimelineProgress: (progress) => set({ timelineProgress: progress }),
}));
