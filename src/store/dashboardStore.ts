import { create } from 'zustand';
import { computeCauses, recommendStrategies } from '../utils/commandEngine';
import { getEmergencyLevel, buildEmergencyTimeline, PHASE_LABELS, generateTasksFromPlan } from '../utils/emergencyEngine';
import { getPlanById } from '../data/emergencyPlans';

export type PortType = 'xuwen' | 'haian' | 'overview';
export type DirectionType = 'inbound' | 'outbound';
export type ViewMode = 'normal' | 'peak' | 'typhoon';
export type SystemMode = 'overview' | 'port' | 'command' | 'emergency' | 'analysis';

interface PortData {
  name: string;
  flow: number;
  status: 'normal' | 'busy' | 'congested';
  congestionIndex: number;
  congestionTime: number;
  congestionDistance: number;
  vehicleFlow: number;
}

interface CongestionPrediction {
  time: string;
  index: number;
  isPredicted: boolean;
}

interface RoadCongestion {
  road: string;
  direction: DirectionType;
  index: number;
  level: string;
  time: number;
  distance: number;
}

export interface AiSummaryMetric {
  value: string;
  label: string;
  color: string;
  tag?: string;
  tagType?: 'up' | 'down' | 'neutral';
}

export interface AiSummaryForecast {
  time: string;
  text: string;
  level: 'info' | 'warn' | 'danger';
}

export interface AiSummaryAction {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  mode?: string; // target system mode
  action?: string; // custom action type
}

export interface AiSummaryCompare {
  label: string;
  value: string;
  good: boolean;
}

export interface CommandFeedItem {
  id: string;
  type: 'system' | 'ai' | 'command' | 'field' | 'approval' | 'alert';
  source: string;
  time: string;
  content: string;
  urgent?: boolean;
  icon?: 'info' | 'ai' | 'user' | 'photo' | 'phone' | 'check' | 'warning' | 'order';
  step?: number; // Associated execution step (1-4)
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

export interface AiSummary {
  level: 'green' | 'yellow' | 'orange' | 'red';
  conclusion: string; // one-line conclusion for collapsed state
  suggestionHint: string; // key suggestion hint in collapsed state
  badges: Array<{ label: string; type: 'flow' | 'port' | 'resilience' }>;
  headerTitle: string; // expanded header title
  metrics: AiSummaryMetric[];
  forecasts: AiSummaryForecast[];
  actions: AiSummaryAction[];
  compares: AiSummaryCompare[];
  compareConclusion: string;
  expanded: boolean;
}

export type NavigationStatus = 'normal' | 'caution' | 'restricted' | 'closed';

export interface StraitTransitIndex {
  indexValue: number;
  windLevel: number;
  visibility: string;
  navigationStatus: NavigationStatus;
}

// === Overview Mode Enhanced Interfaces ===

export interface PortDigestion {
  waitingVehicles: number;
  digestionMinutes: number;
  shipInterval: number;
  shipCapacity: number;
  nextDeparture: string;
  loadEfficiency: number;
}

export type TidalStatus = 'inbound_tide' | 'balanced' | 'outbound_tide';
export type TidalIntensity = 'light' | 'moderate' | 'strong';

export interface TidalEffect {
  inboundFlow: number;
  outboundFlow: number;
  ratio: number;
  status: TidalStatus;
  intensity: TidalIntensity;
  reversalTime: string;
}

export interface CorridorPressureItem {
  name: string;
  currentFlow: number;
  designCapacity: number;
  pressure: number;
  directionLabel: string;
}

export type CorridorDirection = 'north' | 'south' | 'east' | 'west';
export type CorridorPressure = Record<CorridorDirection, CorridorPressureItem>;

export interface CorridorElasticityItem {
  name: string;
  designCapacity: number;
  currentFlow: number;
  remainingPercent: number;
  remainingVehicles: number;
}

export interface SystemResilience {
  score: number;
  subScores: {
    corridorRedundancy: number;
    alternateRoutes: number;
    controlCapacity: number;
    portBuffer: number;
  };
  weakestDimension: string;
}

export type ShutdownLevel = 'low' | 'attention' | 'warning' | 'danger';

export interface ShutdownWindow {
  hours: number;
  probability: number;
  level: ShutdownLevel;
}

export interface ShutdownProbability {
  windows: ShutdownWindow[];
  drivingFactor: string;
}

export type IntersectionStatus = 'normal' | 'near_peak' | 'saturated' | 'overflow';

export interface IntersectionHealth {
  name: string;
  saturation: number;
  status: IntersectionStatus;
}

export type HotspotType = 'recurring' | 'sporadic';

export interface TrafficHotspot {
  name: string;
  index: number;
  type: HotspotType;
  reason: string;
}

export interface UrbanHealth {
  score: number;
  level: string;
  intersections: IntersectionHealth[];
  hotspots: TrafficHotspot[];
}

export interface PressureNode {
  score: number;
  active: boolean;
}

export type PressureOverallStatus = 'decoupled' | 'transmitting' | 'spreading' | 'citywide';

export interface PressureTransmission {
  port: PressureNode;
  corridor: PressureNode;
  city: PressureNode;
  citywide: PressureNode;
  overallStatus: PressureOverallStatus;
}

export type WeatherCouplingLevel = 'none' | 'slight' | 'significant' | 'severe';

export interface WeatherCoupling {
  seaScore: number;
  landScore: number;
  overallScore: number;
  level: WeatherCouplingLevel;
  seaFactors: string[];
  landFactors: string[];
  trend: string;
}

export type EventImpactLevel = 'low' | 'medium' | 'high' | 'critical';

export interface SpecialEvent {
  type: string;
  description: string;
  timeRange: string;
  affectedArea: string;
  impactLevel: EventImpactLevel;
  // 节假日扩展字段
  isHoliday?: boolean;
  startDate?: string; // YYYY-MM-DD
  durationDays?: number;
  baselineMultiplier?: number; // 车流倍数
}

export type BaselineMode = 'normal' | 'holiday';

export interface HolidayContext {
  name: string;
  day: number; // 第几天
  multiplier: number; // 车流倍数
  lastYearSame?: number; // 去年同期车流量
}

export interface CurrentWeather {
  temperature: number;
  condition: string;
  conditionIcon: 'sun' | 'cloud' | 'cloud-rain' | 'cloud-fog';
  windDirection: string;
  windLevel: number;
  visibility: number;
  waveHeight: number;
}

// === End Overview Mode Enhanced Interfaces ===

// === Command Mode Interfaces ===

export type CongestionCauseType = 'port_backlog' | 'traffic_peak' | 'accident' | 'weather' | 'construction' | 'compound';

export interface CongestionCause {
  type: CongestionCauseType;
  label: string;
  confidence: number;
  description: string;
  color: string;
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

// 现场人员
export interface FieldPerson {
  id: string;
  name: string;
  role: string;           // '交警' | '协管' | '拖车司机'
  department: string;     // '交警一队' | '交警二队' | '拖车公司'
  position: [number, number]; // GCJ-02 坐标
  status: 'idle' | 'moving' | 'executing' | 'calling';
  task?: string;          // 当前任务描述
  avatar: string;         // 头像色
  targetPosition?: [number, number];
  trajectory?: [number, number][];
  estimatedArrival?: string;
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
  fieldPersons: FieldPerson[];              // 现场人员列表
  incomingCallPersonId: string | null;      // 来电人员 ID
  isInCall: boolean;                        // 是否在通话中
  callPersonId: string | null;              // 通话对象 ID
  chatWindowOpen: boolean;                  // 聊天窗口是否打开
  activeChatPersonId: string | null;        // 当前私聊人员 ID
}

// === End Command Mode Interfaces ===

// === Emergency Mode Interfaces ===

export type EmergencyLevel = 'IV' | 'III' | 'II' | 'I';
export type EmergencyPhase = 'warning' | 'shutdown_start' | 'peak' | 'recovery_prepare' | 'recovery';

export type PlanId = 'typhoon' | 'fog' | 'spring_rush' | 'major_accident' | 'extreme_stranding' | 'cross_dept';

export interface PlanStep {
  id: string;
  phase: EmergencyPhase;
  department: EmergencyTask['department'];
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
  owner: string;
  timeLimitMinutes: number;
  completionCriteria: string;
  order: number;
}

export interface EmergencyPlan {
  id: PlanId;
  name: string;
  scenario: string;
  triggerConditions: string[];
  coreMeasures: string[];
  responsibleDepts: string[];
  steps: PlanStep[];
}

export interface ActivePlanExecution {
  planId: PlanId;
  activatedAt: string;
  currentPhase: EmergencyPhase;
  generatedTaskIds: string[];
}

export interface EmergencyForecast {
  currentStrandedVehicles: number;
  peakStrandedVehicles: number;
  strandedGrowthPerHour: number;
  estimatedResumeTime: string;
  estimatedRecoveryHours: number;
  estimatedShutdownHours: number;
  coldChainVehicles: number;
  hazardousVehicles: number;
  strandedPhase: EmergencyPhase;
}

export interface EmergencyTask {
  id: string;
  department: '公安交警' | '民政局' | '交通运输局' | '港口管理方' | '城管局' | '应急管理局';
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'received' | 'executing' | 'done';
  owner: string;
  updatedAt: string;
}

export interface EmergencyResourcePoint {
  id: string;
  type: 'parking' | 'supply' | 'personnel' | 'drone' | 'fuel';
  name: string;
  position: [number, number];
  status: 'normal' | 'warning' | 'critical';
  detail: string;
}

export interface EmergencyTimelinePoint {
  time: string;
  value: number;
  isPredicted?: boolean;
  isCurrent?: boolean;
}

export interface EmergencyCommItem {
  id: string;
  type: 'system' | 'department' | 'port' | 'alert' | 'command';
  source: string;
  target?: string;          // recipient department (optional, null = broadcast)
  time: string;
  content: string;
  urgent?: boolean;
  mentions?: string[];      // @mentioned departments
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  department: EmergencyTask['department'];
  phone: string;
  status: 'online' | 'busy' | 'offline';
}

export interface EmergencyState {
  portShutdown: boolean;
  shutdownStartTime: string;
  emergencyLevel: EmergencyLevel;
  bannerTitle: string;
  bannerSubtitle: string;
  phaseLabel: string;
  forecast: EmergencyForecast;
  tasks: EmergencyTask[];
  resourcePoints: EmergencyResourcePoint[];
  timeline: EmergencyTimelinePoint[];
  communications: EmergencyCommItem[];
  contacts: EmergencyContact[];
  activePlan: ActivePlanExecution | null;
  // 台风气象信息
  typhoon: {
    name: string;
    distance: number;       // 距离（公里）
    windLevel: number;       // 风力等级
    windSpeed: number;       // 风速（m/s）
    rainfall: number;        // 降雨量（mm/h）
    visibility: number;      // 能见度（km）
    direction: string;       // 移动方向
    speed: number;           // 移动速度（km/h）
    landingTime: string;     // 预计登陆时间
    warningLevel: '蓝色' | '黄色' | '橙色' | '红色';
  };
}

// === End Emergency Mode Interfaces ===

interface DashboardState {
  // System mode
  systemMode: SystemMode;
  setSystemMode: (mode: SystemMode) => void;

  // Port selection
  selectedPort: PortType;
  setSelectedPort: (port: PortType) => void;

  // Direction selection
  selectedDirection: DirectionType;
  setSelectedDirection: (direction: DirectionType) => void;

  // Device type selection (for checkpoint modal)
  selectedDeviceType: string;
  setSelectedDeviceType: (type: string) => void;

  // View mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Modal states
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  pendingStrategyId: string | null;
  setPendingStrategy: (strategyId: string | null) => void;

  // Selected road for prediction modal
  selectedRoad: string | null;
  setSelectedRoad: (road: string | null) => void;

  // Port data
  portData: Record<PortType, PortData>;
  updatePortData: (port: PortType, data: Partial<PortData>) => void;

  // Congestion predictions
  predictions: CongestionPrediction[];
  setPredictions: (predictions: CongestionPrediction[]) => void;

  // Road congestion data
  roadCongestions: RoadCongestion[];
  setRoadCongestions: (data: RoadCongestion[]) => void;

  // AI Summary
  aiSummary: AiSummary;
  setAiSummary: (summary: AiSummary) => void;
  toggleAiSummaryExpanded: () => void;

  // Strait transit index
  straitTransitIndex: StraitTransitIndex;
  setStraitTransitIndex: (data: StraitTransitIndex) => void;

  // === Overview Mode Enhanced State ===
  portDigestion: Record<'xuwen' | 'haian', PortDigestion>;
  setPortDigestion: (data: Record<'xuwen' | 'haian', PortDigestion>) => void;

  tidalEffect: TidalEffect;
  setTidalEffect: (data: TidalEffect) => void;

  corridorPressure: CorridorPressure;
  setCorridorPressure: (data: CorridorPressure) => void;

  corridorElasticity: CorridorElasticityItem[];
  setCorridorElasticity: (data: CorridorElasticityItem[]) => void;

  systemResilience: SystemResilience;
  setSystemResilience: (data: SystemResilience) => void;

  shutdownProbability: ShutdownProbability;
  setShutdownProbability: (data: ShutdownProbability) => void;

  urbanHealth: UrbanHealth;
  setUrbanHealth: (data: UrbanHealth) => void;

  pressureTransmission: PressureTransmission;
  setPressureTransmission: (data: PressureTransmission) => void;

  weatherCoupling: WeatherCoupling;
  setWeatherCoupling: (data: WeatherCoupling) => void;

  specialEvents: SpecialEvent[];
  setSpecialEvents: (data: SpecialEvent[]) => void;

  // Holiday mode
  baselineMode: BaselineMode;
  setBaselineMode: (mode: BaselineMode) => void;
  holidayContext: HolidayContext | null;
  setHolidayContext: (ctx: HolidayContext | null) => void;

  currentWeather: CurrentWeather;
  setCurrentWeather: (data: CurrentWeather) => void;

  // === Command Mode State ===
  commandState: CommandState;
  setCommandState: (data: Partial<CommandState>) => void;
  enterCommandMode: (action: AiSummaryAction | null) => void;
  exitCommandMode: () => void;
  executeStrategy: (strategyId: string) => void;
  deployDrone: () => void;
  recallDrone: () => void;
  setActiveVideoChannel: (channel: number) => void;
  setCurrentStep: (step: 1 | 2 | 3 | 4 | 5 | 6) => void;
  addCommandFeedItem: (content: string) => void;
  startCall: (personId: string) => void;
  endCall: () => void;
  openChatWith: (personId: string) => void;

  // === Emergency Mode State ===
  emergencyState: EmergencyState;
  setEmergencyState: (data: Partial<EmergencyState>) => void;
  activatePlan: (planId: PlanId) => void;
  advancePlanPhase: (newPhase: EmergencyPhase) => void;
}

// === Original Default Data ===

const defaultPortData: Record<PortType, PortData> = {
  overview: {
    name: '双港总览',
    flow: 12453,
    status: 'normal',
    congestionIndex: 1.85,
    congestionTime: 0,
    congestionDistance: 0,
    vehicleFlow: 520
  },
  xuwen: {
    name: '徐闻港',
    flow: 7234,
    status: 'busy',
    congestionIndex: 3.2,
    congestionTime: 12,
    congestionDistance: 850,
    vehicleFlow: 302
  },
  haian: {
    name: '海安新港',
    flow: 5219,
    status: 'normal',
    congestionIndex: 1.95,
    congestionTime: 0,
    congestionDistance: 0,
    vehicleFlow: 218
  }
};

const generatePredictions = (): CongestionPrediction[] => {
  const now = new Date();
  const predictions: CongestionPrediction[] = [];
  for (let i = 0; i < 7; i++) {
    const time = new Date(now.getTime() + i * 5 * 60 * 1000);
    predictions.push({
      time: `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`,
      index: i === 0
        ? 2.3 + Math.random() * 0.5
        : Math.max(1.5, 2.5 + Math.sin(i * 0.8) * 0.8 + Math.random() * 0.3),
      isPredicted: i > 0
    });
  }
  return predictions;
};

const defaultRoadCongestions: RoadCongestion[] = [
  { road: '进港大道（进港方向）', direction: 'inbound', index: 3.2, level: '轻度拥堵', time: 12, distance: 850 },
  { road: 'G207国道（进港方向）', direction: 'inbound', index: 2.1, level: '畅通', time: 0, distance: 0 },
  { road: 'S376省道（出港方向）', direction: 'outbound', index: 1.8, level: '畅通', time: 0, distance: 0 },
  { road: '海安大道（出港方向）', direction: 'outbound', index: 4.5, level: '中度拥堵', time: 25, distance: 1200 },
  { road: '环半岛公路（进港方向）', direction: 'inbound', index: 2.8, level: '一般', time: 5, distance: 300 },
];

// === Strait Transit Index Default ===

const defaultStraitTransitIndex: StraitTransitIndex = {
  indexValue: 78,
  windLevel: 5,
  visibility: '10km',
  navigationStatus: 'normal',
};

// === Overview Mode Default Mock Data ===

const defaultPortDigestion: Record<'xuwen' | 'haian', PortDigestion> = {
  xuwen: {
    waitingVehicles: 1200,
    digestionMinutes: 340,
    shipInterval: 35,
    shipCapacity: 280,
    nextDeparture: '14:30',
    loadEfficiency: 0.95,
  },
  haian: {
    waitingVehicles: 380,
    digestionMinutes: 120,
    shipInterval: 30,
    shipCapacity: 320,
    nextDeparture: '14:15',
    loadEfficiency: 0.88,
  },
};

const defaultTidalEffect: TidalEffect = {
  inboundFlow: 847,
  outboundFlow: 368,
  ratio: 2.3,
  status: 'inbound_tide',
  intensity: 'moderate',
  reversalTime: '16:30',
};

const defaultCorridorPressure: CorridorPressure = {
  south: {
    name: '南向通道（进港方向）',
    currentFlow: 1840,
    designCapacity: 2000,
    pressure: 92,
    directionLabel: '进港主通道',
  },
  north: {
    name: '北向通道（城区方向）',
    currentFlow: 1400,
    designCapacity: 2000,
    pressure: 70,
    directionLabel: '城区连接',
  },
  west: {
    name: '西向通道（G207方向）',
    currentFlow: 1248,
    designCapacity: 1600,
    pressure: 78,
    directionLabel: 'G207国道',
  },
  east: {
    name: '东向通道（环半岛方向）',
    currentFlow: 700,
    designCapacity: 1400,
    pressure: 50,
    directionLabel: '环半岛公路',
  },
};

const defaultCorridorElasticity: CorridorElasticityItem[] = [
  { name: '进港大道', designCapacity: 2000, currentFlow: 700, remainingPercent: 65, remainingVehicles: 1300 },
  { name: 'G207国道', designCapacity: 1600, currentFlow: 320, remainingPercent: 80, remainingVehicles: 1280 },
  { name: 'S376省道', designCapacity: 800, currentFlow: 680, remainingPercent: 15, remainingVehicles: 120 },
  { name: '环半岛公路', designCapacity: 1400, currentFlow: 770, remainingPercent: 45, remainingVehicles: 630 },
];

const defaultSystemResilience: SystemResilience = {
  score: 45,
  subScores: {
    corridorRedundancy: 28,
    alternateRoutes: 55,
    controlCapacity: 50,
    portBuffer: 35,
  },
  weakestDimension: '通道冗余',
};

const defaultShutdownProbability: ShutdownProbability = {
  windows: [
    { hours: 6, probability: 5, level: 'low' },
    { hours: 24, probability: 35, level: 'attention' },
    { hours: 48, probability: 65, level: 'warning' },
    { hours: 72, probability: 80, level: 'danger' },
  ],
  drivingFactor: '当前无台风预警，风力5级偏南风，海况良好',
};

const defaultUrbanHealth: UrbanHealth = {
  score: 88,
  level: '健康',
  intersections: [
    { name: '教育路口', saturation: 0.82, status: 'near_peak' },
    { name: '城北路口', saturation: 0.65, status: 'normal' },
    { name: '海安大道-S376交叉口', saturation: 0.58, status: 'normal' },
    { name: '徐城镇中心路口', saturation: 0.71, status: 'normal' },
    { name: '南山路口', saturation: 0.45, status: 'normal' },
  ],
  hotspots: [
    { name: '教育路口', index: 3.8, type: 'recurring', reason: '上下学高峰期车流集中' },
    { name: '菠萝交易市场周边', index: 2.9, type: 'recurring', reason: '菠萝运输季货车集散' },
  ],
};

const defaultPressureTransmission: PressureTransmission = {
  port: { score: 62, active: true },
  corridor: { score: 45, active: true },
  city: { score: 28, active: false },
  citywide: { score: 12, active: false },
  overallStatus: 'transmitting',
};

const defaultWeatherCoupling: WeatherCoupling = {
  seaScore: 25,
  landScore: 15,
  overallScore: 25,
  level: 'slight',
  seaFactors: ['偏南风5级', '浪高1.2米', '能见度良好'],
  landFactors: ['阵雨概率20%', '气温32度', '路面干燥'],
  trend: '未来6小时风力稳定，海况良好，不影响通航',
};

const defaultCurrentWeather: CurrentWeather = {
  temperature: 24,
  condition: '暴雨',
  conditionIcon: 'cloud-rain',
  windDirection: '西北',
  windLevel: 10,
  visibility: 2.5,
  waveHeight: 4.5,
};

// === Command Mode Default Mock Data ===

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
    { id: 'f01', type: 'system', source: '系统', time: '15:23', content: '拥堵指数升至 6.5，自动切换指挥模式', icon: 'warning' },
    { id: 'f02', type: 'ai', source: 'AI 分析', time: '15:24', content: '主因：港口积压（70%），建议启动 S376 分流 + 应急车道借用', icon: 'ai' },
    { id: 'f03', type: 'command', source: '指挥员小王', time: '15:25', content: '确认执行 S-02 S376 省道分流', icon: 'check' },
    { id: 'f04', type: 'system', source: '系统', time: '15:25', content: '指令 #CMD-0419-001 已生成，推送至交警队长张三', icon: 'order' },
    { id: 'f05', type: 'field', source: '张三', time: '15:26', content: '收到指令，正在前往 S376 路口', icon: 'user' },
    { id: 'f06', type: 'field', source: '张三', time: '15:27', content: '已到达路口 A，开始引导分流', icon: 'user' },
    { id: 'f07', type: 'system', source: '系统', time: '15:30', content: 'S376 分流已生效 3 分钟，拥堵指数 6.2（↓0.3）', icon: 'info' },
    { id: 'f08', type: 'field', source: '张三', time: '15:32', content: '📷 现场照片：分流车辆正常通行', icon: 'photo' },
    { id: 'f09', type: 'ai', source: 'AI 分析', time: '15:35', content: '⚠ 缓解速度低于预期（实际-0.3 vs 预测-0.8），建议追加策略', icon: 'warning', urgent: true },
    { id: 'f10', type: 'alert', source: '港口调度', time: '15:36', content: '⚠ 15:45 有大船靠港，预计增加 500 辆车', icon: 'warning', urgent: true },
    { id: 'f11', type: 'command', source: '指挥员小王', time: '15:37', content: '追加执行 S-01 应急车道借用，提交领导审批', icon: 'order' },
    { id: 'f12', type: 'approval', source: '值班领导', time: '15:38', content: '审批通过 S-01 应急车道借用', icon: 'check' },
    { id: 'f13', type: 'system', source: '系统', time: '15:39', content: '指令 #CMD-0419-002 已生成，推送至交警队长李四', icon: 'order' },
    { id: 'f14', type: 'field', source: '李四', time: '15:42', content: '📞 请求视频通话：应急车道有违停车辆需拖移', icon: 'phone', urgent: true },
    { id: 'f15', type: 'command', source: '指挥员小王', time: '15:43', content: '已调度拖车前往，预计 5 分钟到达', icon: 'check' },
    { id: 'f16', type: 'system', source: '系统', time: '15:45', content: '拥堵指数 5.1（↓1.4），两个策略协同生效', icon: 'info' },
    { id: 'f17', type: 'ai', source: 'AI 分析', time: '15:50', content: '效果达标，预计 16:15 恢复通畅', icon: 'ai' },
  ],
  resources: {
    policeOnDuty: 6,
    policeAvailable: 3,
    dronesAvailable: 1,
    towTrucksAvailable: 2,
  },
  activeVideoChannel: 0,
  isDroneDeployed: false,
  fieldPersons: [
    {
      id: 'p-01',
      name: '张三',
      role: '交警',
      department: '交警一队',
      position: [110.157380, 20.291170], // 华四村（S376 路口）
      status: 'executing',
      task: '执行 S-02 S376 分流',
      avatar: '#00D0E9',
    },
    {
      id: 'p-02',
      name: '李四',
      role: '交警',
      department: '交警一队',
      position: [110.147502, 20.250149], // 南山上村（应急车道）
      status: 'idle',
      task: undefined,
      avatar: '#2ED573',
    },
    {
      id: 'p-03',
      name: '王五',
      role: '拖车司机',
      department: '拖车公司',
      position: [110.153524, 20.278910], // 高速入口
      status: 'moving',
      task: '前往应急车道清障',
      avatar: '#F5A623',
    },
  ],
  incomingCallPersonId: null,
  isInCall: false,
  callPersonId: null,
  chatWindowOpen: false,
  activeChatPersonId: null,
};

// === End Command Mode Default Mock Data ===

const defaultSpecialEvents: SpecialEvent[] = [
  {
    type: '五一黄金周',
    description: '五一假期第2天，车流量为日常2.8倍，属正常高峰范围',
    timeRange: '2026-05-01 至 2026-05-05',
    affectedArea: '全县各主要通道',
    impactLevel: 'high',
    isHoliday: true,
    startDate: '2026-05-01',
    durationDays: 5,
    baselineMultiplier: 2.8,
  },
  {
    type: '农产品运输季',
    description: '菠萝运输高峰季（3-5月），进港货车流量增加约30%',
    timeRange: '2026-03-01 至 2026-05-31',
    affectedArea: '进港大道、G207国道、菠萝交易市场周边',
    impactLevel: 'medium',
  },
];

const defaultAiSummary: AiSummary = {
  level: 'yellow',
  conclusion: '正常高峰',
  suggestionHint: '建议 14:45 启动 S376 分流',
  badges: [
    { label: '车流 3.5万', type: 'flow' },
    { label: '港口等1200', type: 'port' },
    { label: '韧性 45', type: 'resilience' },
  ],
  headerTitle: '五一假期第 2 天 · 正常高峰范围',
  metrics: [
    { value: '34,847', label: '今日车流', color: '#00D0E9', tag: '2.8x', tagType: 'neutral' },
    { value: '1,200', label: '港口等待(辆)', color: '#FF6B35', tag: '↑ 5h40m', tagType: 'up' },
    { value: '92%', label: '南向通道压力', color: '#F5A623' },
    { value: '45', label: '应急韧性', color: '#F5A623', tag: '薄弱', tagType: 'up' },
  ],
  forecasts: [
    { time: '15:00', text: '预计达到峰值，大船靠港叠加下班高峰', level: 'warn' },
    { time: '15:30', text: '港口压力持续上升，韧性预计降至 35（橙→红）', level: 'danger' },
    { time: '16:30', text: '预计开始回落，压力逐步缓解', level: 'info' },
  ],
  actions: [
    { title: '启动 S376 省道分流', description: '建议 14:45 前执行 · 预计缓解南向 15%', priority: 'high', mode: 'command' },
    { title: '关注东向通道压力', description: '当前 78%，接近预警阈值', priority: 'medium', action: 'locate' },
    { title: '查看港口排队详情', description: '徐闻港 1200辆 · 海安新港 380辆', priority: 'low', mode: 'port' },
  ],
  compares: [
    { label: '车流', value: '-5% ↓', good: true },
    { label: '港口消化', value: '+8% ↑', good: true },
    { label: '通道压力', value: '+3% ↑', good: false },
  ],
  compareConclusion: '整体优于去年',
  expanded: false,
};

// === End Overview Mode Default Mock Data ===

export const useDashboardStore = create<DashboardState>((set) => ({
  // System mode
  systemMode: 'overview',
  setSystemMode: (mode) => set({ systemMode: mode }),

  // Port selection
  selectedPort: 'overview',
  setSelectedPort: (port) => set({ selectedPort: port }),

  // Direction selection
  selectedDirection: 'inbound',
  setSelectedDirection: (direction) => set({ selectedDirection: direction }),

  // Device type selection
  selectedDeviceType: 'checkpoint',
  setSelectedDeviceType: (type) => set({ selectedDeviceType: type }),

  // View mode
  viewMode: 'normal',
  setViewMode: (mode) => set({ viewMode: mode }),

  // Modal states
  activeModal: null,
  setActiveModal: (modal) => set({ activeModal: modal }),
  pendingStrategyId: null,
  setPendingStrategy: (strategyId) => set({ pendingStrategyId: strategyId }),

  // Selected road
  selectedRoad: null,
  setSelectedRoad: (road) => set({ selectedRoad: road }),

  // Port data
  portData: defaultPortData,
  updatePortData: (port, data) => set((state) => ({
    portData: {
      ...state.portData,
      [port]: { ...state.portData[port], ...data }
    }
  })),

  // Predictions
  predictions: generatePredictions(),
  setPredictions: (predictions) => set({ predictions }),

  // Road congestion
  roadCongestions: defaultRoadCongestions,
  setRoadCongestions: (data) => set({ roadCongestions: data }),

  // AI Summary
  aiSummary: defaultAiSummary,
  setAiSummary: (summary) => set({ aiSummary: summary }),
  toggleAiSummaryExpanded: () => set((state) => ({
    aiSummary: { ...state.aiSummary, expanded: !state.aiSummary.expanded },
  })),

  // Strait transit index
  straitTransitIndex: defaultStraitTransitIndex,
  setStraitTransitIndex: (data) => set({ straitTransitIndex: data }),

  // === Overview Mode Enhanced State ===
  portDigestion: defaultPortDigestion,
  setPortDigestion: (data) => set({ portDigestion: data }),

  tidalEffect: defaultTidalEffect,
  setTidalEffect: (data) => set({ tidalEffect: data }),

  corridorPressure: defaultCorridorPressure,
  setCorridorPressure: (data) => set({ corridorPressure: data }),

  corridorElasticity: defaultCorridorElasticity,
  setCorridorElasticity: (data) => set({ corridorElasticity: data }),

  systemResilience: defaultSystemResilience,
  setSystemResilience: (data) => set({ systemResilience: data }),

  shutdownProbability: defaultShutdownProbability,
  setShutdownProbability: (data) => set({ shutdownProbability: data }),

  urbanHealth: defaultUrbanHealth,
  setUrbanHealth: (data) => set({ urbanHealth: data }),

  pressureTransmission: defaultPressureTransmission,
  setPressureTransmission: (data) => set({ pressureTransmission: data }),

  weatherCoupling: defaultWeatherCoupling,
  setWeatherCoupling: (data) => set({ weatherCoupling: data }),

  specialEvents: defaultSpecialEvents,
  setSpecialEvents: (data) => set({ specialEvents: data }),

  // Holiday mode
  baselineMode: 'holiday',
  setBaselineMode: (mode) => set({ baselineMode: mode }),
  holidayContext: { name: '五一黄金周', day: 2, multiplier: 2.8, lastYearSame: 36700 },
  setHolidayContext: (ctx) => set({ holidayContext: ctx }),

  currentWeather: defaultCurrentWeather,
  setCurrentWeather: (data) => set({ currentWeather: data }),

  // === Command Mode State ===
  commandState: defaultCommandState,
  setCommandState: (data) => set((state) => ({
    commandState: { ...state.commandState, ...data },
  })),
  enterCommandMode: (action) => set((state) => {
    const causes = computeCauses(state);
    const strategies = recommendStrategies(causes, state);
    return {
      systemMode: 'command' as SystemMode,
      selectedPort: 'xuwen' as PortType,
      selectedDirection: 'inbound' as DirectionType,
      commandState: {
        ...state.commandState,
        context: { triggerAction: action, activatedAt: Date.now() },
        causes,
        strategies,
        executionSteps: state.commandState.executionSteps.map((s) => ({ ...s, status: 'pending' as const })),
        actualIndex: null,
        currentStep: 1,
      },
    };
  }),
  exitCommandMode: () => set({
    systemMode: 'overview' as SystemMode,
    selectedPort: 'overview' as PortType,
  }),
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
        'S-01': 0, // 城区路口 cam-01
        'S-02': 1, // 华四村 cam-02
        'S-03': 2, // 高速入口 cam-03
        'S-04': 3, // 南山上村 cam-04
        'S-05': 4, // 港口入口 cam-05
        'S-07': 2, // 事故处置 -> 高速入口 cam-03
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

  // === Emergency Mode State ===
  emergencyState: {
    portShutdown: true,
    shutdownStartTime: '14:30',
    emergencyLevel: getEmergencyLevel(3200, 48),
    bannerTitle: '台风"摩羯"橙色预警 · 徐闻港已停航',
    bannerSubtitle: '预计停航 48 小时 · 预计峰值滞留 3200 辆 · 冷链车约 180 辆',
    phaseLabel: '阶段2：停航初期',
    forecast: {
      currentStrandedVehicles: 1960,
      peakStrandedVehicles: 3200,
      strandedGrowthPerHour: 180,
      estimatedResumeTime: '后天 10:00',
      estimatedRecoveryHours: 6,
      estimatedShutdownHours: 48,
      coldChainVehicles: 157,
      hazardousVehicles: 24,
      strandedPhase: 'shutdown_start',
    },
    tasks: [
      { id: 'em-task-1', department: '公安交警', title: '部署 6 组交警至进港大道', priority: 'high', status: 'executing', owner: '王队', updatedAt: '15:02' },
      { id: 'em-task-2', department: '交通运输局', title: '启用 P-1 / P-2 临时停车区', priority: 'high', status: 'received', owner: '李科', updatedAt: '14:58' },
      { id: 'em-task-3', department: '民政局', title: '准备首批 5000 份盒饭和 800 箱水', priority: 'medium', status: 'pending', owner: '张主任', updatedAt: '15:05' },
      { id: 'em-task-4', department: '港口管理方', title: '确认预计复航窗口并回传', priority: 'high', status: 'received', owner: '港调中心', updatedAt: '15:08' },
    ],
    resourcePoints: [
      { id: 'p1', type: 'parking', name: 'P-1 港口周边停车区', position: [110.1465, 20.243], status: 'warning', detail: '容量 350 辆 · 当前使用率 82%' },
      { id: 'p2', type: 'parking', name: 'P-2 S376 交叉口停车区', position: [110.158, 20.289], status: 'normal', detail: '容量 280 辆 · 当前使用率 46%' },
      { id: 's1', type: 'supply', name: '盒饭/饮水发放点', position: [110.1505, 20.263], status: 'normal', detail: '盒饭 3200 份 · 饮水 600 箱' },
      { id: 'g1', type: 'personnel', name: '交警临时指挥点', position: [110.1538, 20.279], status: 'normal', detail: '交警 12 人在岗' },
      { id: 'd1', type: 'drone', name: '无人机巡查点', position: [110.1574, 20.2911], status: 'normal', detail: '无人机 1 架巡逻中' },
    ],
    timeline: buildEmergencyTimeline(1960, 3200),
    communications: [
      { id: 'ec-1', type: 'system', source: '系统', time: '14:30', content: '收到港口停航通知，自动切换应急模式', urgent: true },
      { id: 'ec-2', type: 'port', source: '港口管理方', time: '14:36', content: '预计停航 48 小时，复航时间待气象确认' },
      { id: 'ec-3', type: 'department', source: '公安交警', time: '15:02', content: '首批交警已到进港大道执勤点位' },
    ],
    contacts: [
      { id: 'c1', name: '张队长', role: '队长', department: '公安交警', phone: '13800138001', status: 'online' },
      { id: 'c2', name: '李警官', role: '执勤', department: '公安交警', phone: '13800138002', status: 'online' },
      { id: 'c3', name: '王局长', role: '局长', department: '民政局', phone: '13800138003', status: 'online' },
      { id: 'c4', name: '赵科长', role: '应急科', department: '民政局', phone: '13800138004', status: 'online' },
      { id: 'c5', name: '刘局长', role: '局长', department: '交通运输局', phone: '13800138005', status: 'online' },
      { id: 'c6', name: '陈主任', role: '运管所', department: '交通运输局', phone: '13800138006', status: 'online' },
      { id: 'c7', name: '周经理', role: '调度中心', department: '港口管理方', phone: '13800138007', status: 'online' },
      { id: 'c8', name: '吴主管', role: '工程部', department: '港口管理方', phone: '13800138008', status: 'online' },
      { id: 'c9', name: '郑队长', role: '执法大队', department: '城管局', phone: '13800138009', status: 'online' },
      { id: 'c10', name: '孙队员', role: '现场', department: '城管局', phone: '13800138010', status: 'online' },
      { id: 'c11', name: '马主任', role: '指挥中心', department: '应急管理局', phone: '13800138011', status: 'online' },
      { id: 'c12', name: '钱专员', role: '协调', department: '应急管理局', phone: '13800138012', status: 'online' },
    ],
    typhoon: {
      name: '摩羯',
      distance: 85,
      windLevel: 10,
      windSpeed: 28,
      rainfall: 45,
      visibility: 2.5,
      direction: '西北',
      speed: 18,
      landingTime: '今晚 22:00',
      warningLevel: '橙色',
    },
    activePlan: null,
  },
  setEmergencyState: (data) => set((state) => ({
    emergencyState: { ...state.emergencyState, ...data },
  })),

  activatePlan: (planId) => {
    const plan = getPlanById(planId);
    if (!plan) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentPhase = useDashboardStore.getState().emergencyState.forecast.strandedPhase;
    const tasks = generateTasksFromPlan(plan.steps, currentPhase);
    const generatedIds = tasks.map(t => t.id);
    set((state) => ({
      emergencyState: {
        ...state.emergencyState,
        activePlan: { planId, activatedAt: timeStr, currentPhase, generatedTaskIds: generatedIds },
        tasks: [...state.emergencyState.tasks, ...tasks],
        communications: [
          ...state.emergencyState.communications,
          { id: `ec-plan-${Date.now()}`, type: 'system' as const, source: '系统', time: timeStr, content: `已启动《${plan.name}》，生成 ${tasks.length} 项任务`, urgent: true },
        ],
      },
    }));
  },

  advancePlanPhase: (newPhase) => {
    set((state) => {
      const activePlan = state.emergencyState.activePlan;
      if (!activePlan) return state;
      const plan = getPlanById(activePlan.planId);
      if (!plan) return state;
      const newSteps = plan.steps.filter(
        step => step.phase === newPhase && !activePlan.generatedTaskIds.includes(step.id)
      );
      if (newSteps.length === 0) return state;
      const tasks = generateTasksFromPlan(newSteps, newPhase);
      const newGeneratedIds = tasks.map(t => t.id);
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      return {
        emergencyState: {
          ...state.emergencyState,
          activePlan: {
            ...activePlan,
            currentPhase: newPhase,
            generatedTaskIds: [...activePlan.generatedTaskIds, ...newGeneratedIds],
          },
          forecast: { ...state.emergencyState.forecast, strandedPhase: newPhase },
          phaseLabel: PHASE_LABELS[newPhase],
          tasks: [...state.emergencyState.tasks, ...tasks],
          communications: [
            ...state.emergencyState.communications,
            { id: `ec-phase-${Date.now()}`, type: 'system' as const, source: '系统', time: timeStr, content: `阶段推进至「${PHASE_LABELS[newPhase]}」，追加 ${tasks.length} 项新任务`, urgent: true },
          ],
        },
      };
    });
  },
}));