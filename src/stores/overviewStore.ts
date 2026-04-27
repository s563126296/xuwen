import { create } from 'zustand';
import { PortType, BaselineMode } from './types';

// === Type Definitions ===

export interface PortData {
  name: string;
  flow: number;
  status: 'normal' | 'busy' | 'congested';
  congestionIndex: number;
  congestionTime: number;
  congestionDistance: number;
  vehicleFlow: number;
}

export interface CongestionPrediction {
  time: string;
  index: number;
  isPredicted: boolean;
}

export interface RoadCongestion {
  road: string;
  direction: 'inbound' | 'outbound';
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
  mode?: string;
  action?: string;
}

export interface AiSummaryCompare {
  label: string;
  value: string;
  good: boolean;
}

export interface AiSummary {
  level: 'green' | 'yellow' | 'orange' | 'red';
  conclusion: string;
  suggestionHint: string;
  badges: Array<{ label: string; type: 'flow' | 'port' | 'resilience' }>;
  headerTitle: string;
  metrics: AiSummaryMetric[];
  forecasts: AiSummaryForecast[];
  actions: AiSummaryAction[];
  compares: AiSummaryCompare[];
  compareConclusion: string;
  expanded: boolean;

  // v2.0 new fields
  riskForecast?: {
    next30min: 'low' | 'medium' | 'high';
    next1hour: 'low' | 'medium' | 'high';
  };

  predictionConfidence?: number; // 0-100

  // Phase 2 fields (add but don't use yet)
  influenceFactors?: {
    port: number;      // 0-100
    traffic: number;   // 0-100
    weather: number;   // 0-100
    event: number;     // 0-100
  };

  similarCases?: Array<{
    date: string;
    similarity: number;
    strategy: string;
    effectTime: number;
  }>;

  learningStats?: {
    casesLearned: number;
    weeklyAdoptionRate: number;
    predictionAccuracy: number;
  };
}

export type NavigationStatus = 'normal' | 'caution' | 'restricted' | 'closed';

export interface StraitTransitIndex {
  indexValue: number;
  windLevel: number;
  visibility: string;
  navigationStatus: NavigationStatus;
}

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
  isHoliday?: boolean;
  startDate?: string;
  durationDays?: number;
  baselineMultiplier?: number;
}

export interface HolidayContext {
  name: string;
  day: number;
  multiplier: number;
  lastYearSame?: number;
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

// === Default Data ===

const defaultPortData: Record<PortType, PortData> = {
  overview: {
    name: '\u53CC\u6E2F\u603B\u89C8',
    flow: 12453,
    status: 'normal',
    congestionIndex: 1.85,
    congestionTime: 0,
    congestionDistance: 0,
    vehicleFlow: 520
  },
  xuwen: {
    name: '\u5F90\u95FB\u6E2F',
    flow: 7234,
    status: 'busy',
    congestionIndex: 3.2,
    congestionTime: 12,
    congestionDistance: 850,
    vehicleFlow: 302
  },
  haian: {
    name: '\u6D77\u5B89\u65B0\u6E2F',
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
  { road: '\u8FDB\u6E2F\u5927\u9053\uFF08\u8FDB\u6E2F\u65B9\u5411\uFF09', direction: 'inbound', index: 3.2, level: '\u8F7B\u5EA6\u62E5\u5835', time: 12, distance: 850 },
  { road: 'G207\u56FD\u9053\uFF08\u8FDB\u6E2F\u65B9\u5411\uFF09', direction: 'inbound', index: 2.1, level: '\u7545\u901A', time: 0, distance: 0 },
  { road: 'S376\u7701\u9053\uFF08\u51FA\u6E2F\u65B9\u5411\uFF09', direction: 'outbound', index: 1.8, level: '\u7545\u901A', time: 0, distance: 0 },
  { road: '\u6D77\u5B89\u5927\u9053\uFF08\u51FA\u6E2F\u65B9\u5411\uFF09', direction: 'outbound', index: 4.5, level: '\u4E2D\u5EA6\u62E5\u5835', time: 25, distance: 1200 },
  { road: '\u73AF\u534A\u5C9B\u516C\u8DEF\uFF08\u8FDB\u6E2F\u65B9\u5411\uFF09', direction: 'inbound', index: 2.8, level: '\u4E00\u822C', time: 5, distance: 300 },
];

const defaultStraitTransitIndex: StraitTransitIndex = {
  indexValue: 78,
  windLevel: 5,
  visibility: '10km',
  navigationStatus: 'normal',
};

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
    name: '\u5357\u5411\u901A\u9053\uFF08\u8FDB\u6E2F\u65B9\u5411\uFF09',
    currentFlow: 1840,
    designCapacity: 2000,
    pressure: 92,
    directionLabel: '\u8FDB\u6E2F\u4E3B\u901A\u9053',
  },
  north: {
    name: '\u5317\u5411\u901A\u9053\uFF08\u57CE\u533A\u65B9\u5411\uFF09',
    currentFlow: 1400,
    designCapacity: 2000,
    pressure: 70,
    directionLabel: '\u57CE\u533A\u8FDE\u63A5',
  },
  west: {
    name: '\u897F\u5411\u901A\u9053\uFF08G207\u65B9\u5411\uFF09',
    currentFlow: 1248,
    designCapacity: 1600,
    pressure: 78,
    directionLabel: 'G207\u56FD\u9053',
  },
  east: {
    name: '\u4E1C\u5411\u901A\u9053\uFF08\u73AF\u534A\u5C9B\u65B9\u5411\uFF09',
    currentFlow: 700,
    designCapacity: 1400,
    pressure: 50,
    directionLabel: '\u73AF\u534A\u5C9B\u516C\u8DEF',
  },
};

const defaultCorridorElasticity: CorridorElasticityItem[] = [
  { name: '\u8FDB\u6E2F\u5927\u9053', designCapacity: 2000, currentFlow: 700, remainingPercent: 65, remainingVehicles: 1300 },
  { name: 'G207\u56FD\u9053', designCapacity: 1600, currentFlow: 320, remainingPercent: 80, remainingVehicles: 1280 },
  { name: 'S376\u7701\u9053', designCapacity: 800, currentFlow: 680, remainingPercent: 15, remainingVehicles: 120 },
  { name: '\u73AF\u534A\u5C9B\u516C\u8DEF', designCapacity: 1400, currentFlow: 770, remainingPercent: 45, remainingVehicles: 630 },
];

const defaultSystemResilience: SystemResilience = {
  score: 45,
  subScores: {
    corridorRedundancy: 28,
    alternateRoutes: 55,
    controlCapacity: 50,
    portBuffer: 35,
  },
  weakestDimension: '\u901A\u9053\u5197\u4F59',
};

const defaultShutdownProbability: ShutdownProbability = {
  windows: [
    { hours: 6, probability: 5, level: 'low' },
    { hours: 24, probability: 35, level: 'attention' },
    { hours: 48, probability: 65, level: 'warning' },
    { hours: 72, probability: 80, level: 'danger' },
  ],
  drivingFactor: '\u5F53\u524D\u65E0\u53F0\u98CE\u9884\u8B66\uFF0C\u98CE\u529B5\u7EA7\u504F\u5357\u98CE\uFF0C\u6D77\u51B5\u826F\u597D',
};

const defaultUrbanHealth: UrbanHealth = {
  score: 88,
  level: '\u5065\u5EB7',
  intersections: [
    { name: '\u6559\u80B2\u8DEF\u53E3', saturation: 0.82, status: 'near_peak' },
    { name: '\u57CE\u5317\u8DEF\u53E3', saturation: 0.65, status: 'normal' },
    { name: '\u6D77\u5B89\u5927\u9053-S376\u4EA4\u53C9\u53E3', saturation: 0.58, status: 'normal' },
    { name: '\u5F90\u57CE\u9547\u4E2D\u5FC3\u8DEF\u53E3', saturation: 0.71, status: 'normal' },
    { name: '\u5357\u5C71\u8DEF\u53E3', saturation: 0.45, status: 'normal' },
  ],
  hotspots: [
    { name: '\u6559\u80B2\u8DEF\u53E3', index: 3.8, type: 'recurring', reason: '\u4E0A\u4E0B\u5B66\u9AD8\u5CF0\u671F\u8F66\u6D41\u96C6\u4E2D' },
    { name: '\u83E0\u841D\u4EA4\u6613\u5E02\u573A\u5468\u8FB9', index: 2.9, type: 'recurring', reason: '\u83E0\u841D\u8FD0\u8F93\u5B63\u8D27\u8F66\u96C6\u6563' },
  ],
};

const defaultPressureTransmission: PressureTransmission = {
  port: { score: 82, active: true },
  corridor: { score: 58, active: true },
  city: { score: 35, active: true },
  citywide: { score: 18, active: false },
  overallStatus: 'spreading',
};

const defaultWeatherCoupling: WeatherCoupling = {
  seaScore: 25,
  landScore: 15,
  overallScore: 25,
  level: 'slight',
  seaFactors: ['\u504F\u5357\u98CE5\u7EA7', '\u6D6A\u9AD81.2\u7C73', '\u80FD\u89C1\u5EA6\u826F\u597D'],
  landFactors: ['\u9635\u96E8\u6982\u738720%', '\u6C14\u6E2932\u5EA6', '\u8DEF\u9762\u5E72\u71E5'],
  trend: '\u672A\u67656\u5C0F\u65F6\u98CE\u529B\u7A33\u5B9A\uFF0C\u6D77\u51B5\u826F\u597D\uFF0C\u4E0D\u5F71\u54CD\u901A\u822A',
};

const defaultCurrentWeather: CurrentWeather = {
  temperature: 24,
  condition: '\u66B4\u96E8',
  conditionIcon: 'cloud-rain',
  windDirection: '\u897F\u5317',
  windLevel: 10,
  visibility: 2.5,
  waveHeight: 4.5,
};

const defaultSpecialEvents: SpecialEvent[] = [
  {
    type: '\u4E94\u4E00\u9EC4\u91D1\u5468',
    description: '\u4E94\u4E00\u5047\u671F\u7B2C2\u5929\uFF0C\u8F66\u6D41\u91CF\u4E3A\u65E5\u5E382.8\u500D\uFF0C\u5C5E\u6B63\u5E38\u9AD8\u5CF0\u8303\u56F4',
    timeRange: '2026-05-01 \u81F3 2026-05-05',
    affectedArea: '\u5168\u53BF\u5404\u4E3B\u8981\u901A\u9053',
    impactLevel: 'high',
    isHoliday: true,
    startDate: '2026-05-01',
    durationDays: 5,
    baselineMultiplier: 2.8,
  },
  {
    type: '\u519C\u4EA7\u54C1\u8FD0\u8F93\u5B63',
    description: '\u83E0\u841D\u8FD0\u8F93\u9AD8\u5CF0\u5B63\uFF083-5\u6708\uFF09\uFF0C\u8FDB\u6E2F\u8D27\u8F66\u6D41\u91CF\u589E\u52A0\u7EA630%',
    timeRange: '2026-03-01 \u81F3 2026-05-31',
    affectedArea: '\u8FDB\u6E2F\u5927\u9053\u3001G207\u56FD\u9053\u3001\u83E0\u841D\u4EA4\u6613\u5E02\u573A\u5468\u8FB9',
    impactLevel: 'medium',
  },
];

const defaultAiSummary: AiSummary = {
  level: 'yellow',
  conclusion: '\u6B63\u5E38\u9AD8\u5CF0',
  suggestionHint: '\u5EFA\u8BAE 14:45 \u542F\u52A8 S376 \u5206\u6D41',
  badges: [
    { label: '\u8F66\u6D41 3.5\u4E07', type: 'flow' },
    { label: '\u6E2F\u53E3\u7B491200', type: 'port' },
    { label: '\u97E7\u6027 45', type: 'resilience' },
  ],
  headerTitle: '\u4E94\u4E00\u5047\u671F\u7B2C 2 \u5929 \xB7 \u6B63\u5E38\u9AD8\u5CF0\u8303\u56F4',
  metrics: [
    { value: '34,847', label: '\u4ECA\u65E5\u8F66\u6D41', color: '#00D0E9', tag: '2.8x', tagType: 'neutral' },
    { value: '1,200', label: '\u6E2F\u53E3\u7B49\u5F85(\u8F86)', color: '#FF6B35', tag: '\u2191 5h40m', tagType: 'up' },
    { value: '92%', label: '\u5357\u5411\u901A\u9053\u538B\u529B', color: '#F5A623' },
    { value: '45', label: '\u5E94\u6025\u97E7\u6027', color: '#F5A623', tag: '\u8584\u5F31', tagType: 'up' },
  ],
  forecasts: [
    { time: '15:00', text: '\u9884\u8BA1\u8FBE\u5230\u5CF0\u503C\uFF0C\u5927\u8239\u9760\u6E2F\u53E0\u52A0\u4E0B\u73ED\u9AD8\u5CF0', level: 'warn' },
    { time: '15:30', text: '\u6E2F\u53E3\u538B\u529B\u6301\u7EED\u4E0A\u5347\uFF0C\u97E7\u6027\u9884\u8BA1\u964D\u81F3 35\uFF08\u6A59\u2192\u7EA2\uFF09', level: 'danger' },
    { time: '16:30', text: '\u9884\u8BA1\u5F00\u59CB\u56DE\u843D\uFF0C\u538B\u529B\u9010\u6B65\u7F13\u89E3', level: 'info' },
  ],
  actions: [
    { title: '\u542F\u52A8 S376 \u7701\u9053\u5206\u6D41', description: '\u5EFA\u8BAE 14:45 \u524D\u6267\u884C \xB7 \u9884\u8BA1\u7F13\u89E3\u5357\u5411 15%', priority: 'high', mode: 'command' },
    { title: '\u5173\u6CE8\u4E1C\u5411\u901A\u9053\u538B\u529B', description: '\u5F53\u524D 78%\uFF0C\u63A5\u8FD1\u9884\u8B66\u9608\u503C', priority: 'medium', action: 'locate' },
    { title: '\u67E5\u770B\u6E2F\u53E3\u6392\u961F\u8BE6\u60C5', description: '\u5F90\u95FB\u6E2F 1200\u8F86 \xB7 \u6D77\u5B89\u65B0\u6E2F 380\u8F86', priority: 'low', mode: 'port' },
  ],
  compares: [
    { label: '\u8F66\u6D41', value: '-5% \u2193', good: true },
    { label: '\u6E2F\u53E3\u6D88\u5316', value: '+8% \u2191', good: true },
    { label: '\u901A\u9053\u538B\u529B', value: '+3% \u2191', good: false },
  ],
  compareConclusion: '\u6574\u4F53\u4F18\u4E8E\u53BB\u5E74',
  expanded: false,
  // v2.0 new fields
  riskForecast: { next30min: 'medium', next1hour: 'medium' },
  predictionConfidence: 82,
};

// === Store Interface ===

interface OverviewState {
  portData: Record<PortType, PortData>;
  updatePortData: (port: PortType, data: Partial<PortData>) => void;

  predictions: CongestionPrediction[];
  setPredictions: (predictions: CongestionPrediction[]) => void;

  roadCongestions: RoadCongestion[];
  setRoadCongestions: (data: RoadCongestion[]) => void;

  aiSummary: AiSummary;
  setAiSummary: (summary: AiSummary) => void;
  toggleAiSummaryExpanded: () => void;

  straitTransitIndex: StraitTransitIndex;
  setStraitTransitIndex: (data: StraitTransitIndex) => void;

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

  baselineMode: BaselineMode;
  setBaselineMode: (mode: BaselineMode) => void;

  holidayContext: HolidayContext | null;
  setHolidayContext: (ctx: HolidayContext | null) => void;

  currentWeather: CurrentWeather;
  setCurrentWeather: (data: CurrentWeather) => void;

  // v2.0 Phase 2: Active alert popup
  activeAlert: {
    id: string;
    type: string;
    title: string;
    content: string;
    factors: { name: string; weight: number }[];
    suggestion: string;
    timestamp: number;
  } | null;
  setActiveAlert: (alert: OverviewState['activeAlert']) => void;
  clearActiveAlert: () => void;
}

// === Store Implementation ===

export const useOverviewStore = create<OverviewState>((set) => ({
  portData: defaultPortData,
  updatePortData: (port, data) => set((state) => ({
    portData: {
      ...state.portData,
      [port]: { ...state.portData[port], ...data }
    }
  })),

  predictions: generatePredictions(),
  setPredictions: (predictions) => set({ predictions }),

  roadCongestions: defaultRoadCongestions,
  setRoadCongestions: (data) => set({ roadCongestions: data }),

  aiSummary: defaultAiSummary,
  setAiSummary: (summary) => set({ aiSummary: summary }),
  toggleAiSummaryExpanded: () => set((state) => ({
    aiSummary: { ...state.aiSummary, expanded: !state.aiSummary.expanded },
  })),

  straitTransitIndex: defaultStraitTransitIndex,
  setStraitTransitIndex: (data) => set({ straitTransitIndex: data }),

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

  baselineMode: 'holiday',
  setBaselineMode: (mode) => set({ baselineMode: mode }),

  holidayContext: { name: '\u4E94\u4E00\u9EC4\u91D1\u5468', day: 2, multiplier: 2.8, lastYearSame: 36700 },
  setHolidayContext: (ctx) => set({ holidayContext: ctx }),

  currentWeather: defaultCurrentWeather,
  setCurrentWeather: (data) => set({ currentWeather: data }),

  // v2.0 Phase 2: Active alert popup
  activeAlert: null,
  setActiveAlert: (alert) => set({ activeAlert: alert }),
  clearActiveAlert: () => set({ activeAlert: null }),
}));
