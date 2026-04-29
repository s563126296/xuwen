import { create } from 'zustand';
import { computeCauses, recommendStrategies } from '../utils/commandEngine';
import { useUIStore } from './uiStore';
import { useOverviewStore } from './overviewStore';
import type { AiSummaryAction } from './overviewStore';
import type { RiskPrediction } from '../utils/riskPredictionEngine';

type SystemMode = 'overview' | 'port' | 'command' | 'emergency' | 'analysis';
type PortType = 'xuwen' | 'haian' | 'overview';
type DirectionType = 'inbound' | 'outbound';

// Pre-computed data for early command mode entry (high-risk pre-preparation)
export interface PrecomputedCommandData {
  riskPrediction?: RiskPrediction;
  precomputedCauses?: import('./commandStore').CongestionCause[];
  precomputedStrategies?: import('./commandStore').CommandStrategy[];
  earlyEntry?: boolean; // true when entering before actual threshold
}

// === Command Mode Type Definitions ===

export type CongestionCauseType = 'port_backlog' | 'traffic_peak' | 'accident' | 'weather' | 'construction' | 'compound';

export interface CongestionCause {
  type: CongestionCauseType;
  label: string;
  confidence: number;
  description: string;
  color: string;
}

export interface ResourceRequirement {
  type: 'police' | 'cone' | 'led_screen' | 'tow_truck';
  quantity: number;
  estimatedArrivalMin: number;
}

export interface EffectModel {
  baseEffect: number;
  factorModifiers: {
    weather_rain: number;
    weather_fog: number;
    truck_ratio_high: number;
    road_congested: number;
    inflow_high: number;
  };
}

export interface HistoricalData {
  executionCount: number;
  successRate: number;
  avgReliefMinutes: number;
}

export type StrategyPermission = 'auto' | 'confirm' | 'approve';

export interface CommandStrategy {
  id: string;
  name: string;
  recommended: boolean;
  permission: StrategyPermission;
  permissionLabel: string;
  effect: string;
  time: string;
  reduce: string;
  difficulty: number;
  effectTime: string;
  risk: string;
  triggerCondition: string;
  status: 'idle' | 'executing' | 'done' | 'failed';
  reasonTemplate?: string;
  requiredResources?: ResourceRequirement[];
  effectModel?: EffectModel;
  historicalData?: HistoricalData;
}

export interface StrategyConflict {
  type: 'mutex' | 'constraint' | 'linkage';
  strategyA: string;
  strategyB: string;
  reason: string;
  severity: 'error' | 'warning';
}

export interface ExecutionStep {
  label: string;
  status: 'pending' | 'active' | 'done';
}

export interface TimelineSlot {
  time: string;
  value: number;
  color: string;
  isCurrent?: boolean;
  isPredicted?: boolean;
}

export interface CommandContext {
  triggerAction: AiSummaryAction | null;
  activatedAt: number;
}

export interface FieldPerson {
  id: string;
  name: string;
  role: string;
  department: string;
  position: [number, number];
  status: 'idle' | 'moving' | 'executing' | 'calling';
  task?: string;
  avatar: string;
  targetPosition?: [number, number];
  trajectory?: [number, number][];
  estimatedArrival?: string;
}

export interface CommandFeedItem {
  id: string;
  type: 'system' | 'ai' | 'command' | 'field' | 'approval' | 'alert';
  source: string;
  time: string;
  content: string;
  urgent?: boolean;
  icon?: 'info' | 'ai' | 'user' | 'photo' | 'phone' | 'check' | 'warning' | 'order';
  step?: number;
}

export interface CommandResourceStatus {
  policeOnDuty: number;
  policeAvailable: number;
  dronesAvailable: number;
  towTrucksAvailable: number;
}

export interface CommandFocusRoad {
  road: string;
  queueLength: string;
  vehicles: number;
  dangerousGoods: number;
  coldChain: number;
  durationMinutes: number;
  futureInflow: number;
}

export interface ExpectationVersion {
  version: number;
  checkpoints: { minutesAfter: number; expected: number }[];
  reason: string;
  timestamp: number;
}

export interface CurveDataPoint {
  timestamp: number;
  minutesAfter: number;
  expected: number;
  actual: number;
}

export interface ActiveInquiry {
  id: string;
  target: 'commander' | 'field';
  question: string;
  options: string[];
  status: 'pending' | 'answered' | 'timeout';
  answer?: string;
  createdAt: number;
}

export interface StrategyFeedback {
  rating: 'effective' | 'ineffective' | null;
  comment: string;
  timestamp: number;
}

export type DeviationLevel = 'none' | 'yellow' | 'orange' | 'red';

export type DeviationType = 'strategy' | 'execution' | 'environment';

export interface DeviationFactor {
  factor: string;
  weight: number; // 0-100
  category: DeviationType;
  description: string;
}

export interface DeviationAnalysis {
  timestamp: number;
  deviationPercent: number;
  primaryType: DeviationType;
  factors: DeviationFactor[];
  recommendation: string;
}

export interface ExecutionVersion {
  version: string;
  content: string;
  reason: string;
  expectedCurve: { minutesAfter: number; expected: number }[];
  timestamp: number;
}

export interface DeviationEvent {
  timestamp: number;
  type: 'strategy' | 'execution' | 'environment';
  reason: string;
  action: string;
  resolutionMinutes: number;
}

export interface AILearning {
  newFactor: string;
  affectedStrategies: string[];
  accuracyChange: { before: number; after: number };
}

export interface ExecutionRecord {
  id: string;
  strategyId: string;
  startTime: number;
  endTime: number | null;
  versions: ExecutionVersion[];
  actualCurve: { timestamp: number; congestionIndex: number }[];
  deviationEvents: DeviationEvent[];
  resourceArrival: { estimated: number; actual: number };
  rating: 'effective' | 'moderate' | 'ineffective' | null;
  comment: string;
  aiLearnings: AILearning[];
}

export interface MonitorState {
  isMonitoring: boolean;
  monitorStartTime: number;
  monitorStrategyId: string | null;
  curveData: CurveDataPoint[];
  deviationLevel: DeviationLevel;
  deviationPercent: number;
  expectationVersions: ExpectationVersion[];
  activeInquiry: ActiveInquiry | null;
  feedback: StrategyFeedback | null;
}

export interface CommandState {
  context: CommandContext;
  congestionIndex: number;
  congestionTrend: 'rising' | 'stable' | 'falling';
  congestionDist: string;
  congestionTime: number;
  affectedVehicles: number;
  coldChainCount: number;
  causes: CongestionCause[];
  spreadRoads: string[];
  strategies: CommandStrategy[];
  executionSteps: ExecutionStep[];
  timeline: TimelineSlot[];
  predictedIndex: number;
  actualIndex: number | null;
  historyEffects: Array<{ name: string; rate: number; color: string }>;
  currentStep: 1 | 2 | 3 | 4 | 5 | 6;
  estimatedRelief: string;
  focusRoad: CommandFocusRoad;
  commandFeed: CommandFeedItem[];
  resources: CommandResourceStatus;
  activeVideoChannel: number;
  isDroneDeployed: boolean;
  fieldPersons: FieldPerson[];
  incomingCallPersonId: string | null;
  isInCall: boolean;
  callPersonId: string | null;
  chatWindowOpen: boolean;
  activeChatPersonId: string | null;
  executionResources: {
    personnel: Array<{ id: string; name: string; dept: string; status: 'executing' | 'standby' | 'enroute'; task: string }>;
    materials: Array<{ name: string; total: number; ready: number; unit: string }>;
  };
  historyStats: { totalExecuted: number; adoptionRate: number; avgReliefMinutes: number; top3: Array<{ name: string; avgMinutes: number }> };

  // v2.0: Scene awareness (congestion vs emergency)
  commandScene: 'congestion' | 'emergency';

  // v2.0: Emergency features (migrated from emergencyStore)
  specialVehicles: Array<{
    id: string;
    plate: string;
    type: 'cold_chain' | 'hazmat';
    waitTime: number;
    status: 'normal' | 'warning' | 'critical';
    cargo: string;
  }>;

  supplyDemand: Array<{
    name: string;
    required: number;
    allocated: number;
    unit: string;
  }>;

  emergencyTasks: Array<{
    id: string;
    department: string;
    title: string;
    status: 'pending' | 'received' | 'executing' | 'completed';
    owner: string;
  }>;

  activePlan: {
    planId: string;
    planName: string;
    progress: number;
  } | null;

  // v2.0: Strategy expected effect timeline (P0-4)
  strategyTimeline: {
    strategyName: string;
    startTime: string;
    checkpoints: Array<{
      time: string;
      minutesAfter: number;
      expected: number;
      actual: number | null;
      status: 'pending' | 'on-track' | 'off-track';
    }>;
    overallStatus: 'executing' | 'on-track' | 'off-track' | 'completed';
  } | null;

  // v2.0 P1-1: Strategy execution closed-loop monitoring
  monitorState: MonitorState;

  // v2.0 Batch1: Execution records for learning loop
  executionRecords: ExecutionRecord[];
  activeExecutionId: string | null;
}

// === Default Command State ===

const defaultCommandState: CommandState = {
  context: { triggerAction: null, activatedAt: 0 },
  congestionIndex: 6.5,
  congestionTrend: 'rising',
  congestionDist: '3.2 公里',
  congestionTime: 42,
  affectedVehicles: 850,
  coldChainCount: 47,
  causes: [
    { type: 'port_backlog', label: '港口积压型', confidence: 70, description: '徐闻港排队车辆 1200 辆，消化时间 5h40min', color: '#DC2626' },
    { type: 'traffic_peak', label: '流量高峰型', confidence: 20, description: '五一假期第 2 天，车流量为日常 2.8 倍', color: '#F59E0B' },
    { type: 'construction', label: '施工占道型', confidence: 10, description: 'S376 省道 K12+500 路段施工，占用一车道', color: '#A0A8B4' },
  ],
  spreadRoads: ['进港大道全段', 'G207 城区段', 'S376 北段', '城区主干道'],
  strategies: [
    {
      id: 'S-01', name: '应急车道借用', recommended: true, permission: 'approve', permissionLabel: '🔴 需审批',
      effect: '6.5 → 4.8', time: '约 30 分钟', reduce: '~350 辆', difficulty: 2,
      effectTime: '5 分钟生效', risk: '应急车辆通行受限，需保留紧急通道',
      triggerCondition: '进港大道拥堵指数 > 6.0 且排队 > 2km',
      status: 'idle',
    },
    {
      id: 'S-02', name: 'S376 省道分流', recommended: true, permission: 'confirm', permissionLabel: '🟡 需确认',
      effect: '6.5 → 5.2', time: '约 20 分钟', reduce: '~200 辆', difficulty: 1,
      effectTime: '3 分钟生效', risk: 'S376 沿线居民出行受影响',
      triggerCondition: '进港大道拥堵指数 > 4.0',
      status: 'idle',
    },
  ],
  executionSteps: [
    { label: '策略确认', status: 'pending' },
    { label: '指令下发', status: 'pending' },
    { label: '现场执行', status: 'pending' },
    { label: '效果验证', status: 'pending' },
  ],
  timeline: [
    { time: '15:00', value: 12, color: '#10B981' },
    { time: '15:15', value: 14, color: '#10B981' },
    { time: '15:30', value: 18, color: '#F59E0B' },
    { time: '15:45', value: 22, color: '#F59E0B' },
    { time: '16:00', value: 28, color: '#F97316' },
    { time: '16:15', value: 32, color: '#DC2626' },
    { time: '16:30', value: 35, color: '#DC2626' },
    { time: '16:45', value: 36, color: '#DC2626', isCurrent: true },
    { time: '17:00', value: 34, color: '#DC2626', isPredicted: true },
    { time: '17:15', value: 30, color: '#F97316', isPredicted: true },
    { time: '17:30', value: 24, color: '#F59E0B', isPredicted: true },
    { time: '17:45', value: 20, color: '#F59E0B', isPredicted: true },
    { time: '18:00', value: 16, color: '#10B981', isPredicted: true },
  ],
  predictedIndex: 4.8,
  actualIndex: null,
  historyEffects: [
    { name: 'S-01 应急车道借用', rate: 89, color: '#10B981' },
    { name: 'S-02 S376 分流', rate: 76, color: '#00D0E9' },
    { name: 'S-04 信号灯优化', rate: 62, color: '#F59E0B' },
  ],
  currentStep: 1,
  estimatedRelief: '约 45 分钟',
  focusRoad: {
    road: '进港大道',
    queueLength: '3.2 公里',
    vehicles: 1200,
    dangerousGoods: 3,
    coldChain: 47,
    durationMinutes: 42,
    futureInflow: 300,
  },
  commandFeed: [
    { id: 'f01', type: 'system', source: '系统', time: '14:30', content: '拥堵指数 6.5，自动切换指挥模式', icon: 'warning' },
    { id: 'f02', type: 'ai', source: 'AI分析', time: '14:31', content: '主因：港口积压(70%)，建议S376分流+应急车道', icon: 'ai' },
    { id: 'f03', type: 'command', source: '指挥员', time: '14:33', content: '确认执行 S-02 S376省道分流', icon: 'check' },
    { id: 'f04', type: 'system', source: '系统', time: '14:33', content: '指令 #CMD-0501-001 已生成，推送至张三', icon: 'order' },
    { id: 'f05', type: 'field', source: '张三', time: '14:35', content: '已到达华四村路口，开始执行分流', icon: 'user' },
    { id: 'f06', type: 'field', source: '李四', time: '14:35', content: '南山镇路口发现冷链车故障，请求拖车支援', icon: 'phone', urgent: true },
    { id: 'f07', type: 'command', source: '指挥员', time: '14:37', content: '调度王五拖车前往南山镇', icon: 'check' },
    { id: 'f08', type: 'field', source: '王五', time: '14:38', content: '收到，正在赶往南山镇，预计8分钟到达', icon: 'user' },
    { id: 'f09', type: 'ai', source: 'AI分析', time: '14:40', content: '建议启动S376分流，预计减压200辆', icon: 'ai' },
    { id: 'f10', type: 'field', source: '张三', time: '14:42', content: '华四村分流进行中，已分流50辆', icon: 'photo' },
    { id: 'f11', type: 'system', source: '系统', time: '14:45', content: 'S376分流生效12分钟，拥堵指数6.2（下降0.3）', icon: 'info' },
    { id: 'f12', type: 'field', source: '郑十', time: '14:47', content: '无人机巡查：迈陈镇路段有违停车辆', icon: 'warning' },
    { id: 'f13', type: 'command', source: '指挥员', time: '14:48', content: '周八处理迈陈镇违停', icon: 'order' },
    { id: 'f14', type: 'field', source: '周八', time: '14:50', content: '违停已清除，车道恢复', icon: 'user' },
    { id: 'f15', type: 'field', source: '冯十一', time: '14:52', content: '港口调度：新增2个船班，加快消化', icon: 'user' },
    { id: 'f16', type: 'system', source: '系统', time: '14:55', content: 'G207城区段流量激增，需要限流', icon: 'warning' },
    { id: 'f17', type: 'ai', source: 'AI分析', time: '14:56', content: '建议启动应急车道，拥堵指数>6.0', icon: 'ai' },
    { id: 'f18', type: 'field', source: '赵六', time: '14:57', content: 'G207城区入口请求启动应急车道', icon: 'phone', urgent: true },
    { id: 'f19', type: 'command', source: '指挥员', time: '14:58', content: '提交 S-01 应急车道至领导审批', icon: 'order' },
    { id: 'f20', type: 'approval', source: '值班领导', time: '14:59', content: '批准 S-01 应急车道启用', icon: 'check' },
    { id: 'f21', type: 'system', source: '系统', time: '15:00', content: '指令 #CMD-0501-002 已生成，推送至周八', icon: 'order' },
    { id: 'f22', type: 'field', source: '周八', time: '15:02', content: '迈陈路段应急车道已启用', icon: 'user' },
    { id: 'f23', type: 'system', source: '系统', time: '15:05', content: '拥堵指数5.8（下降0.7），双策略协同生效', icon: 'info' },
    { id: 'f24', type: 'field', source: '王五', time: '15:08', content: '冷链车已拖离，南山镇车道恢复', icon: 'user' },
    { id: 'f25', type: 'ai', source: 'AI分析', time: '15:10', content: '进展顺利，预计16:30全面缓解，疏散时间缩短至4h20min', icon: 'ai' },
  ],
  resources: {
    policeOnDuty: 10,
    policeAvailable: 4,
    dronesAvailable: 2,
    towTrucksAvailable: 2,
  },
  activeVideoChannel: 0,
  isDroneDeployed: false,
  fieldPersons: [
    { id: 'p-01', name: '张三', role: '交警', department: '交警支队', position: [110.157380, 20.291170], status: 'executing', task: 'S376分流执行', avatar: '👮' },
    { id: 'p-02', name: '李四', role: '交警', department: '交警支队', position: [110.147502, 20.250149], status: 'idle', task: '交通疏导', avatar: '👮' },
    { id: 'p-03', name: '王五', role: '拖车司机', department: '应急保障', position: [110.153524, 20.278910], status: 'moving', task: '赶赴南山镇', avatar: '🚗', targetPosition: [110.147502, 20.250149], estimatedArrival: '8分钟' },
    { id: 'p-04', name: '赵六', role: '交警', department: '交警支队', position: [110.160745, 20.306732], status: 'executing', task: '流量监控', avatar: '👮' },
    { id: 'p-05', name: '孙七', role: '交警', department: '交警支队', position: [110.141114, 20.233385], status: 'executing', task: '秩序维护', avatar: '👮' },
    { id: 'p-06', name: '周八', role: '交警', department: '交警支队', position: [110.150478, 20.264358], status: 'executing', task: '应急车道管控', avatar: '👮' },
    { id: 'p-07', name: '吴九', role: '拖车司机', department: '应急保障', position: [110.143228, 20.245138], status: 'idle', task: 'S376路口待命', avatar: '🚗' },
    { id: 'p-08', name: '郑十', role: '无人机操作员', department: '技术支持', position: [110.136, 20.233], status: 'executing', task: '空中巡查', avatar: '🚁' },
    { id: 'p-09', name: '冯十一', role: '港口调度员', department: '港口管理', position: [110.134812, 20.232438], status: 'executing', task: '船班协调', avatar: '⚓' },
    { id: 'p-10', name: '陈十二', role: '交警', department: '交警支队', position: [110.139, 20.259], status: 'idle', task: '预备力量', avatar: '👮' },
  ],
  incomingCallPersonId: null,
  isInCall: false,
  callPersonId: null,
  chatWindowOpen: false,
  activeChatPersonId: null,
  executionResources: {
    personnel: [
      { id: 'er-1', name: '张三', dept: '交警支队', status: 'executing', task: 'S376华四村路口分流' },
      { id: 'er-2', name: '李四', dept: '交警支队', status: 'standby', task: '交通疏导待命' },
      { id: 'er-3', name: '王五', dept: '应急保障', status: 'enroute', task: '赶赴南山镇拖车' },
      { id: 'er-4', name: '赵六', dept: '交警支队', status: 'executing', task: 'G207城区段流量监控' },
      { id: 'er-5', name: '孙七', dept: '交警支队', status: 'executing', task: '进港大道秩序维护' },
      { id: 'er-6', name: '周八', dept: '交警支队', status: 'executing', task: '迈陈路段应急车道管控' },
      { id: 'er-7', name: '吴九', dept: '应急保障', status: 'standby', task: 'S376路口待命' },
      { id: 'er-8', name: '郑十', dept: '技术支持', status: 'executing', task: '无人机空中巡查' },
      { id: 'er-9', name: '冯十一', dept: '港口管理', status: 'executing', task: '港口船班协调' },
      { id: 'er-10', name: '陈十二', dept: '交警支队', status: 'standby', task: '预备力量待命' },
    ],
    materials: [
      { name: '拖车', total: 2, ready: 1, unit: '台' },
      { name: '警力', total: 10, ready: 4, unit: '组' },
      { name: '锥桶', total: 30, ready: 24, unit: '个' },
      { name: '诱导屏', total: 4, ready: 2, unit: '块' },
    ],
  },
  historyStats: {
    totalExecuted: 12,
    adoptionRate: 67,
    avgReliefMinutes: 28,
    top3: [
      { name: 'S-04 信号灯优化', avgMinutes: 22 },
      { name: 'S-02 S376分流', avgMinutes: 31 },
      { name: 'S-14 交警部署', avgMinutes: 35 },
    ],
  },

  // v2.0: Scene awareness
  commandScene: 'congestion',

  // v2.0: Emergency features mock data
  specialVehicles: [
    { id: 'sv-1', plate: '粤G·K7823', type: 'cold_chain', waitTime: 135, status: 'warning', cargo: '冷冻海鲜' },
    { id: 'sv-2', plate: '琼A·D3156', type: 'cold_chain', waitTime: 130, status: 'warning', cargo: '冷冻水产' },
    { id: 'sv-3', plate: '粤G·M5521', type: 'hazmat', waitTime: 110, status: 'normal', cargo: '液化石油气' },
  ],
  supplyDemand: [
    { name: '盒饭', required: 38800, allocated: 15000, unit: '份' },
    { name: '饮用水', required: 23000, allocated: 10000, unit: '升' },
    { name: '应急电源', required: 180, allocated: 50, unit: '台' },
  ],
  emergencyTasks: [
    { id: 'et-1', department: '公安交警', title: '部署停车区引导标识', status: 'executing', owner: '李科' },
    { id: 'et-2', department: '民政局', title: '准备3天物资', status: 'received', owner: '王主任' },
    { id: 'et-3', department: '交通运输局', title: '更新诱导屏提示', status: 'completed', owner: '张科' },
  ],
  activePlan: null,
  strategyTimeline: {
    strategyName: 'S-02 S376省道分流',
    startTime: '17:15',
    checkpoints: [
      { time: '17:45', minutesAfter: 30, expected: 5.8, actual: 5.9, status: 'on-track' },
      { time: '18:15', minutesAfter: 60, expected: 5.2, actual: null, status: 'pending' },
      { time: '18:45', minutesAfter: 90, expected: 4.5, actual: null, status: 'pending' },
      { time: '19:15', minutesAfter: 120, expected: 4.0, actual: null, status: 'pending' },
    ],
    overallStatus: 'executing',
  },
  monitorState: {
    isMonitoring: false,
    monitorStartTime: 0,
    monitorStrategyId: null,
    curveData: [],
    deviationLevel: 'none',
    deviationPercent: 0,
    expectationVersions: [],
    activeInquiry: null,
    feedback: null,
  },
  executionRecords: [],
  activeExecutionId: null,
};

// === Command Store Interface ===

interface CommandStoreState {
  commandState: CommandState;
  setCommandState: (data: Partial<CommandState>) => void;
  setCommandScene: (scene: 'congestion' | 'emergency') => void;
  enterCommandMode: (action: AiSummaryAction | null, precomputed?: PrecomputedCommandData) => void;
  exitCommandMode: () => void;
  executeStrategy: (strategyId: string) => void;
  deployDrone: () => void;
  recallDrone: () => void;
  setActiveVideoChannel: (channel: number) => void;
  setCurrentStep: (step: 1 | 2 | 3 | 4 | 5 | 6) => void;
  addCommandFeedItem: (content: string) => void;
  addAIFeedItem: (content: string) => void;
  startCall: (personId: string) => void;
  endCall: () => void;
  openChatWith: (personId: string) => void;
  setMonitorState: (data: Partial<MonitorState>) => void;
  addCurveDataPoint: (point: CurveDataPoint) => void;
  addExpectationVersion: (version: ExpectationVersion) => void;
  setActiveInquiry: (inquiry: ActiveInquiry | null) => void;
  setStrategyFeedback: (feedback: StrategyFeedback | null) => void;
  addExecutionRecord: (record: ExecutionRecord) => void;
  updateExecutionRecord: (id: string, updates: Partial<ExecutionRecord>) => void;
  setActiveExecutionId: (id: string | null) => void;
}

// === Command Store Implementation ===

export const useCommandStore = create<CommandStoreState>((set) => ({
  commandState: defaultCommandState,

  setCommandState: (data) => set((state) => ({
    commandState: { ...state.commandState, ...data },
  })),

  setCommandScene: (scene) => set((state) => ({
    commandState: { ...state.commandState, commandScene: scene },
  })),

  setMonitorState: (data) => set((state) => ({
    commandState: {
      ...state.commandState,
      monitorState: { ...state.commandState.monitorState, ...data },
    },
  })),

  addCurveDataPoint: (point) => set((state) => ({
    commandState: {
      ...state.commandState,
      monitorState: {
        ...state.commandState.monitorState,
        curveData: [...state.commandState.monitorState.curveData, point],
      },
    },
  })),

  addExpectationVersion: (version) => set((state) => ({
    commandState: {
      ...state.commandState,
      monitorState: {
        ...state.commandState.monitorState,
        expectationVersions: [...state.commandState.monitorState.expectationVersions, version],
      },
    },
  })),

  setActiveInquiry: (inquiry) => set((state) => ({
    commandState: {
      ...state.commandState,
      monitorState: { ...state.commandState.monitorState, activeInquiry: inquiry },
    },
  })),

  setStrategyFeedback: (feedback) => set((state) => ({
    commandState: {
      ...state.commandState,
      monitorState: { ...state.commandState.monitorState, feedback },
    },
  })),

  addExecutionRecord: (record) => set((state) => ({
    commandState: {
      ...state.commandState,
      executionRecords: [...state.commandState.executionRecords, record],
    },
  })),

  updateExecutionRecord: (id, updates) => set((state) => ({
    commandState: {
      ...state.commandState,
      executionRecords: state.commandState.executionRecords.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    },
  })),

  setActiveExecutionId: (id) => set((state) => ({
    commandState: { ...state.commandState, activeExecutionId: id },
  })),

  enterCommandMode: (action, precomputed) => set((state) => {
    // Get overview data for cause computation
    const overviewState = useOverviewStore.getState();
    const engineSlice = {
      portDigestion: overviewState.portDigestion,
      tidalEffect: overviewState.tidalEffect,
      corridorPressure: overviewState.corridorPressure,
      weatherCoupling: overviewState.weatherCoupling,
      specialEvents: overviewState.specialEvents,
    };

    // Use precomputed attribution/recommendation when entering early from predictive trigger
    const causes = precomputed?.precomputedCauses ?? computeCauses(engineSlice);
    const strategies = precomputed?.precomputedStrategies ?? recommendStrategies(causes, engineSlice);

    // Pre-query available resources for early entry
    const availableResources = {
      policeOnDuty: 10,
      policeAvailable: 4,
      dronesAvailable: 2,
      towTrucksAvailable: 2,
    };

    // Add pre-preparation feed entries when entering early
    const precomputedFeedItems = precomputed?.earlyEntry
      ? [
          {
            id: `precompute-system-${Date.now()}`,
            type: 'system' as const,
            source: '系统',
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
            content: `已提前进入指挥模式，预测 ${precomputed.riskPrediction?.timeToReach ?? 30} 分钟后拥堵指数将达 ${precomputed.riskPrediction?.predictedIndex.toFixed(1) ?? '6.0'}`,
            icon: 'warning' as const,
          },
          {
            id: `precompute-ai-${Date.now() + 1}`,
            type: 'ai' as const,
            source: 'AI分析',
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
            content: `已完成预判归因、策略预推荐和资源预查询。当前可用资源：警力 ${availableResources.policeAvailable} 组、无人机 ${availableResources.dronesAvailable} 架、拖车 ${availableResources.towTrucksAvailable} 台`,
            icon: 'ai' as const,
          },
        ]
      : [];

    // Update UI store for cross-store communication
    useUIStore.getState().setSystemMode('command' as SystemMode);
    useUIStore.getState().setSelectedPort('xuwen' as PortType);
    useUIStore.getState().setSelectedDirection('inbound' as DirectionType);

    return {
      commandState: {
        ...state.commandState,
        context: { triggerAction: action, activatedAt: Date.now() },
        causes,
        strategies,
        resources: availableResources,
        congestionIndex: precomputed?.earlyEntry && precomputed.riskPrediction
          ? Math.max(state.commandState.congestionIndex, precomputed.riskPrediction.predictedIndex - 1.2)
          : state.commandState.congestionIndex,
        predictedIndex: precomputed?.riskPrediction?.predictedIndex ?? state.commandState.predictedIndex,
        executionSteps: state.commandState.executionSteps.map((s) => ({ ...s, status: 'pending' as const })),
        actualIndex: null,
        currentStep: 1,
        commandFeed: precomputedFeedItems.length > 0
          ? [...precomputedFeedItems, ...state.commandState.commandFeed]
          : state.commandState.commandFeed,
      },
    };
  }),

  exitCommandMode: () => {
    // Update UI store for cross-store communication
    useUIStore.getState().setSystemMode('overview' as SystemMode);
    useUIStore.getState().setSelectedPort('overview' as PortType);
  },

  executeStrategy: (strategyId) => {
    // Helper: get current time as HH:MM
    const getTimeStr = () => {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    };

    // Helper: get MMDD string like "0419"
    const getMMDD = () => {
      const now = new Date();
      return `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    };

    // Helper: map strategyId to responsible person
    const getResponsible = (id: string) => {
      if (id === 'S-01' || id === 'S-02') return '张三';
      if (id === 'S-04' || id === 'S-05') return '李四';
      return '王五';
    };

    // Helper: map strategyId to short name
    const getShortName = (id: string, fallback: string) => {
      const map: Record<string, string> = {
        'S-01': '应急车道借用',
        'S-02': 'S376分流',
        'S-04': '信号灯优化',
        'S-05': '港口增班',
      };
      return map[id] ?? fallback;
    };

    const responsible = getResponsible(strategyId);

    // Helper: map strategyId to camera channel
    const getCameraChannel = (id: string) => {
      const map: Record<string, number> = {
        'S-01': 0,
        'S-02': 1,
        'S-03': 2,
        'S-04': 3,
        'S-05': 4,
        'S-07': 2,
      };
      return map[id] ?? 0;
    };

    const linkedChannel = getCameraChannel(strategyId);

    // Phase 0: mark strategy executing, update steps, append confirm + order messages, switch camera
    set((state) => {
      const strategy = state.commandState.strategies.find((s) => s.id === strategyId);
      const strategyName = strategy?.name ?? strategyId;
      const mmdd = getMMDD();
      const orderSeq = state.commandState.commandFeed.filter((f) => f.icon === 'order').length + 1;
      const timeStr = getTimeStr();

      const confirmMsg: CommandFeedItem = {
        id: `cmd-confirm-${Date.now()}`,
        type: 'command',
        source: '指挥员',
        time: timeStr,
        content: `确认执行 ${strategyName}`,
        icon: 'check',
        step: 1,
      };

      const orderMsg: CommandFeedItem = {
        id: `cmd-order-${Date.now() + 1}`,
        type: 'system',
        source: '系统',
        time: timeStr,
        content: `指令 #CMD-${mmdd}-${String(orderSeq).padStart(3, '0')} 已生成，推送至交警队长${responsible}`,
        icon: 'order',
        step: 2,
      };

      return {
        commandState: {
          ...state.commandState,
          strategies: state.commandState.strategies.map((s) =>
            s.id === strategyId ? { ...s, status: 'executing' as const } : s
          ),
          executionSteps: [
            { label: '策略确认', status: 'done' as const },
            { label: '指令下发', status: 'done' as const },
            { label: '现场执行', status: 'active' as const },
            { label: '效果验证', status: 'pending' as const },
          ],
          currentStep: 4,
          activeVideoChannel: linkedChannel,
          commandFeed: [orderMsg, confirmMsg, ...state.commandState.commandFeed],
        },
      };
    });

    // Start closed-loop monitoring
    setTimeout(() => {
      import('../utils/strategyMonitorEngine').then(({ startMonitoring }) => {
        startMonitoring(strategyId);
      });
    }, 1000);

    // Phase 1 (2s): congestion starts dropping + field exec message
    setTimeout(() => {
      set((state) => {
        const predicted = state.commandState.predictedIndex;
        const current = state.commandState.congestionIndex;
        const midpoint = (current + predicted) / 2;
        const strategy = state.commandState.strategies.find((s) => s.id === strategyId);
        const shortName = getShortName(strategyId, strategy?.name ?? strategyId);
        const timeStr = getTimeStr();

        const fieldMsg: CommandFeedItem = {
          id: `field-exec-${Date.now()}`,
          type: 'field',
          source: responsible,
          time: timeStr,
          content: `已到达现场，开始执行${shortName}`,
          icon: 'user',
          step: 3,
        };

        return {
          commandState: {
            ...state.commandState,
            congestionIndex: Number(midpoint.toFixed(1)),
            congestionTrend: 'falling' as const,
            actualIndex: Number((midpoint + 0.2).toFixed(1)),
            currentStep: 5,
            commandFeed: [fieldMsg, ...state.commandState.commandFeed],
          },
        };
      });
    }, 2000);

    // Phase 2 (4s): reach predicted level, mark verification active + effect message
    setTimeout(() => {
      set((state) => {
        const predicted = state.commandState.predictedIndex;
        const initialIndex = state.commandState.congestionIndex;
        const finalIndex = Number(predicted.toFixed(1));
        const reduction = Number((initialIndex - finalIndex).toFixed(1));
        const timeStr = getTimeStr();

        const effectMsg: CommandFeedItem = {
          id: `effect-${Date.now()}`,
          type: 'system',
          source: '系统',
          time: timeStr,
          content: `拥堵指数 ${finalIndex}（↓${reduction}），策略生效`,
          icon: 'info',
          step: 4,
        };

        return {
          commandState: {
            ...state.commandState,
            congestionIndex: predicted,
            congestionTrend: 'falling' as const,
            actualIndex: Number((predicted + 0.3).toFixed(1)),
            executionSteps: [
              { label: '策略确认', status: 'done' as const },
              { label: '指令下发', status: 'done' as const },
              { label: '现场执行', status: 'done' as const },
              { label: '效果验证', status: 'active' as const },
            ],
            strategies: state.commandState.strategies.map((s) =>
              s.id === strategyId
                ? { ...s, status: 'done' as const }
                : s
            ),
            currentStep: 6,
            commandFeed: [effectMsg, ...state.commandState.commandFeed],
          },
        };
      });
    }, 4000);
  },

  deployDrone: () => {
    set((state) => ({
      commandState: {
        ...state.commandState,
        isDroneDeployed: true,
        resources: {
          ...state.commandState.resources,
          dronesAvailable: state.commandState.resources.dronesAvailable - 1,
        },
      },
    }));
  },

  recallDrone: () => {
    set((state) => ({
      commandState: {
        ...state.commandState,
        isDroneDeployed: false,
        activeVideoChannel: 0,
        resources: {
          ...state.commandState.resources,
          dronesAvailable: state.commandState.resources.dronesAvailable + 1,
        },
      },
    }));
  },

  setActiveVideoChannel: (channel) => {
    set((state) => ({
      commandState: {
        ...state.commandState,
        activeVideoChannel: channel,
      },
    }));
  },

  setCurrentStep: (step) => set((state) => ({
    commandState: { ...state.commandState, currentStep: step },
  })),

  addCommandFeedItem: (content) => {
    set((state) => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const newItem: CommandFeedItem = {
        id: `cmd-reply-${Date.now()}`,
        type: 'command',
        source: '指挥员',
        time: timeStr,
        content,
        icon: 'check',
      };
      return {
        commandState: {
          ...state.commandState,
          commandFeed: [newItem, ...state.commandState.commandFeed],
        },
      };
    });
  },

  addAIFeedItem: (content) => {
    set((state) => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const newItem: CommandFeedItem = {
        id: `ai-feedback-${Date.now()}`,
        type: 'ai',
        source: 'AI分析',
        time: timeStr,
        content,
        icon: 'ai',
      };
      return {
        commandState: {
          ...state.commandState,
          commandFeed: [newItem, ...state.commandState.commandFeed],
        },
      };
    });
  },

  startCall: (personId) => {
    set((state) => ({
      commandState: {
        ...state.commandState,
        isInCall: true,
        callPersonId: personId,
      },
    }));
  },

  endCall: () => {
    set((state) => ({
      commandState: {
        ...state.commandState,
        isInCall: false,
        callPersonId: null,
      },
    }));
  },

  openChatWith: (personId) => {
    set((state) => ({
      commandState: {
        ...state.commandState,
        chatWindowOpen: true,
        activeChatPersonId: personId,
      },
    }));
  },
}));

/**
 * Get current execution phase based on strategy status
 * - 'selecting': all strategies are idle (no execution yet)
 * - 'executing': at least one strategy is executing
 * - 'completed': at least one strategy is done, none executing
 */
export function getCurrentExecutionPhase(state: CommandState): 'selecting' | 'executing' | 'completed' {
  const hasExecuting = state.strategies.some((s) => s.status === 'executing');
  const hasDone = state.strategies.some((s) => s.status === 'done');

  if (hasExecuting) return 'executing';
  if (hasDone) return 'completed';
  return 'selecting';
}








