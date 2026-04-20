import { create } from 'zustand';

export interface TrendPrediction {
  date: string;
  predicted: number;
  actual?: number;
  confidence: number;
  upper: number;
  lower: number;
}

export interface CausalNode {
  id: string;
  cause: string;
  effect: string;
  confidence: number;
  description: string;
  value?: number;
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: number;
  confidence: number;
  category: string;
  timestamp: string;
}

export interface SafetyMetrics {
  violations: number;
  accidents: number;
  aiWarnings: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recentEvents: Array<{
    id: string;
    type: string;
    location: string;
    time: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export interface AIDecisionState {
  trendPredictions: TrendPrediction[];
  causalChain: CausalNode[];
  recommendations: AIRecommendation[];
  safetyMetrics: SafetyMetrics;
}

const mockTrendPredictions: TrendPrediction[] = [
  { date: '04/14', predicted: 1.82, actual: 1.85, confidence: 95, upper: 1.92, lower: 1.72 },
  { date: '04/15', predicted: 1.76, actual: 1.78, confidence: 94, upper: 1.88, lower: 1.64 },
  { date: '04/16', predicted: 1.91, actual: 1.89, confidence: 93, upper: 2.05, lower: 1.77 },
  { date: '04/17', predicted: 2.15, actual: 2.12, confidence: 92, upper: 2.32, lower: 1.98 },
  { date: '04/18', predicted: 2.38, actual: 2.41, confidence: 91, upper: 2.58, lower: 2.18 },
  { date: '04/19', predicted: 2.22, actual: 2.19, confidence: 90, upper: 2.45, lower: 1.99 },
  { date: '04/20', predicted: 1.95, confidence: 89, upper: 2.21, lower: 1.69 },
  { date: '04/21', predicted: 2.08, confidence: 87, upper: 2.38, lower: 1.78 },
  { date: '04/22', predicted: 2.31, confidence: 85, upper: 2.67, lower: 1.95 },
  { date: '04/23', predicted: 2.45, confidence: 83, upper: 2.88, lower: 2.02 },
  { date: '04/24', predicted: 2.18, confidence: 81, upper: 2.65, lower: 1.71 },
  { date: '04/25', predicted: 1.87, confidence: 79, upper: 2.38, lower: 1.36 },
  { date: '04/26', predicted: 1.72, confidence: 77, upper: 2.28, lower: 1.16 },
];

const mockCausalChain: CausalNode[] = [
  {
    id: 'c1',
    cause: '港口释放',
    effect: '通道压力',
    confidence: 85,
    description: '港口车辆集中释放导致进港大道压力上升',
    value: 2847,
  },
  {
    id: 'c2',
    cause: '通道压力',
    effect: '城区拥堵',
    confidence: 78,
    description: '通道拥堵传导至城区主干道',
    value: 1.92,
  },
  {
    id: 'c3',
    cause: '城区拥堵',
    effect: '港口反压',
    confidence: 72,
    description: '城区拥堵反向影响港口疏散效率',
    value: 68,
  },
];

const mockRecommendations: AIRecommendation[] = [
  {
    id: 'r1',
    title: '建议启动港口分流预案',
    description: '当前港口待渡车辆超过2500辆，建议启动分流预案，引导部分车辆至海安港',
    priority: 'high',
    impact: 85,
    confidence: 88,
    category: '港口调度',
    timestamp: '14:23',
  },
  {
    id: 'r2',
    title: '优化进港大道信号配时',
    description: '预测17:00-18:00进港大道将出现拥堵峰值，建议提前调整信号灯配时',
    priority: 'high',
    impact: 78,
    confidence: 82,
    category: '信号优化',
    timestamp: '14:18',
  },
  {
    id: 'r3',
    title: '增开16:30加班船次',
    description: '根据客流预测，建议增开16:30加班船次，可降低拥堵指数0.3',
    priority: 'medium',
    impact: 72,
    confidence: 75,
    category: '运力调配',
    timestamp: '14:05',
  },
  {
    id: 'r4',
    title: '关注G207国道南段异常',
    description: 'AI检测到G207国道南段车流异常，建议派遣巡逻车辆查看',
    priority: 'medium',
    impact: 65,
    confidence: 71,
    category: '异常监测',
    timestamp: '13:52',
  },
  {
    id: 'r5',
    title: '启动跨海联动预警',
    description: '海南侧客流增长明显，建议启动跨海联动预警机制',
    priority: 'low',
    impact: 58,
    confidence: 68,
    category: '联动协调',
    timestamp: '13:40',
  },
];

const mockSafetyMetrics: SafetyMetrics = {
  violations: 156,
  accidents: 3,
  aiWarnings: 12,
  riskLevel: 'medium',
  recentEvents: [
    { id: 'e1', type: '违停', location: '进港大道K3+200', time: '14:15', severity: 'medium' },
    { id: 'e2', type: '超速', location: '徐海大道东段', time: '14:08', severity: 'low' },
    { id: 'e3', type: '异常停车', location: '南港大道', time: '13:52', severity: 'high' },
    { id: 'e4', type: '逆行', location: '环城路', time: '13:35', severity: 'high' },
    { id: 'e5', type: '违停', location: 'G15入口', time: '13:20', severity: 'medium' },
  ],
};

export const useAIDecisionStore = create<AIDecisionState>(() => ({
  trendPredictions: mockTrendPredictions,
  causalChain: mockCausalChain,
  recommendations: mockRecommendations,
  safetyMetrics: mockSafetyMetrics,
}));
