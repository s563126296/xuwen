import { create } from 'zustand';

// ===== 类型定义 =====

export interface StraitIndex {
  score: number;           // 0-100
  windLevel: number;       // 风力等级 1-12
  visibility: number;      // 能见度 km
  waveHeight: number;      // 浪高 m
  navigationStatus: 'open' | 'restricted' | 'closed';
}

export interface WeatherData {
  windDirection: number;   // 风向角度 0-360
  windSpeed: number;       // 风速 m/s
  temperature: number;
  humidity: number;
  tideStatus: 'rising' | 'falling' | 'high' | 'low';
  forecast: Array<{ hour: number; windLevel: number; visibility: number; waveHeight: number }>;
  suspensionWarning: boolean;
}

export interface PortCapacity {
  availableVessels: number;
  availableSlots: number;
  totalSlots: number;
  loadRate: number;        // 0-100
  hourlyTrend: number[];   // 过去4小时装载率
}

export interface PortVessel {
  id: string;
  name: string;
  position: [number, number]; // [lng, lat]
  course: number;          // 航向
  speed: number;           // 节
  status: 'sailing' | 'docked' | 'waiting';
  destination: string;
  eta: string;             // 预计到港时间 "14:30"
  loadRate: number;        // 装载率 0-100
  laneId: string;
  progress: number;        // 0-1 航线进度
  trail: [number, number][]; // 最近5个历史位置
}

export interface ScheduleItem {
  id: string;
  time: string;            // "14:30"
  lane: string;            // 航线名
  vesselName: string;      // 船名
  remainingSlots: number;
  totalSlots: number;
  status: 'waiting' | 'loading' | 'departed';
}

export interface QueueData {
  totalVehicles: number;
  estimatedWait: number;   // 分钟
  trend: Array<{ time: string; count: number }>;
  byType: { car: number; truck: number; hazmat: number };
}

export interface PortComparison {
  dailyTrips: number;
  todayVolume: number;
  loadRate: number;
  avgWait: number;         // 分钟
}

export interface CrossingStats {
  todayTotal: number;
  yoyChange: number;       // 百分比
  hourlyDistribution: number[]; // 24个值
  byType: { car: number; truck: number; bus: number };
}

export interface WaitingArea {
  name: string;
  capacity: number;
  current: number;
  byType: { car: number; truck: number; hazmat: number };
}

export interface PortState {
  straitIndex: StraitIndex;
  weather: WeatherData;
  portCapacity: Record<'xuwen' | 'haian', PortCapacity>;
  vessels: PortVessel[];
  schedule: ScheduleItem[];
  queue: QueueData;
  comparison: Record<'xuwen' | 'haian', PortComparison>;
  crossingStats: CrossingStats;
  waitingAreas: WaitingArea[];

  // 选中状态
  selectedVessel: string | null;
  selectedPort: 'xuwen' | 'haian' | null;

  // Actions
  setSelectedVessel: (id: string | null) => void;
  setSelectedPort: (port: 'xuwen' | 'haian' | null) => void;
  updateVessels: (vessels: PortVessel[]) => void;
  updateStraitIndex: (index: StraitIndex) => void;
  updateWeather: (weather: WeatherData) => void;
  updateQueue: (queue: QueueData) => void;
}

// ===== Mock 数据生成 =====

const generateStraitIndex = (): StraitIndex => ({
  score: 82,
  windLevel: 4,
  visibility: 12.5,
  waveHeight: 0.8,
  navigationStatus: 'open'
});

const generateWeather = (): WeatherData => ({
  windDirection: 135,
  windSpeed: 8.2,
  temperature: 26,
  humidity: 72,
  tideStatus: 'rising',
  forecast: [
    { hour: 14, windLevel: 4, visibility: 12.5, waveHeight: 0.8 },
    { hour: 15, windLevel: 4, visibility: 13.0, waveHeight: 0.7 },
    { hour: 16, windLevel: 5, visibility: 11.8, waveHeight: 0.9 },
    { hour: 17, windLevel: 5, visibility: 10.5, waveHeight: 1.0 },
    { hour: 18, windLevel: 6, visibility: 9.2, waveHeight: 1.2 },
    { hour: 19, windLevel: 6, visibility: 8.5, waveHeight: 1.3 }
  ],
  suspensionWarning: false
});

const generatePortCapacity = (port: 'xuwen' | 'haian'): PortCapacity => {
  if (port === 'xuwen') {
    return {
      availableVessels: 8,
      availableSlots: 156,
      totalSlots: 240,
      loadRate: 65,
      hourlyTrend: [58, 62, 68, 65]
    };
  } else {
    return {
      availableVessels: 6,
      availableSlots: 98,
      totalSlots: 180,
      loadRate: 54,
      hourlyTrend: [48, 52, 56, 54]
    };
  }
};

const VESSEL_NAMES = [
  '粤海铁1号',
  '紫荆22号',
  '椰香公主号',
  '新海港1号',
  '海口8号',
  '北部湾66号',
  '海棠湾号',
  '琼州1号'
];

const generateVessels = (): PortVessel[] => {
  const vesselData = [
    { id: 'vessel-lane-xuwen-xinhai-1', position: [110.19044, 20.272314] as [number, number], course: 161.8, speed: 12, laneId: 'xuwen-xinhai', progress: 0.15 },
    { id: 'vessel-lane-xuwen-xinhai-2', position: [110.206496, 20.181734] as [number, number], course: -177.2, speed: 15, laneId: 'xuwen-xinhai', progress: 0.52 },
    { id: 'vessel-lane-xuwen-xinhai-3', position: [110.183867, 20.092565] as [number, number], course: -155.1, speed: 18, laneId: 'xuwen-xinhai', progress: 0.88 },
    { id: 'vessel-lane-haian-xiuying-1', position: [110.205773, 20.213793] as [number, number], course: 4.3, speed: 15, laneId: 'haian-xiuying', progress: 0.28 },
    { id: 'vessel-lane-haian-xiuying-2', position: [110.211824, 20.138672] as [number, number], course: -14.4, speed: 18, laneId: 'haian-xiuying', progress: 0.61 },
    { id: 'vessel-lane-haian-xiuying-3', position: [110.246037, 20.07057] as [number, number], course: -35.7, speed: 21, laneId: 'haian-xiuying', progress: 0.95 },
    { id: 'vessel-lane-haian-nangang-1', position: [110.229623, 20.203229] as [number, number], course: 3.3, speed: 18, laneId: 'haian-nangang', progress: 0.35 },
    { id: 'vessel-lane-haian-nangang-2', position: [110.212967, 20.125272] as [number, number], course: 20, speed: 21, laneId: 'haian-nangang', progress: 0.72 }
  ];

  return vesselData.map((v, idx) => {
    const name = VESSEL_NAMES[idx];
    const isToHainan = v.laneId.includes('xuwen') || v.laneId.includes('haian');
    const destination = isToHainan ? '海口' : '徐闻';
    const loadRate = 55 + Math.floor(Math.random() * 35);

    // 生成历史轨迹（最近5个位置）
    const trail: [number, number][] = [];
    for (let i = 4; i >= 0; i--) {
      const offset = i * 0.005;
      trail.push([
        v.position[0] - offset * Math.cos(v.course * Math.PI / 180),
        v.position[1] - offset * Math.sin(v.course * Math.PI / 180)
      ]);
    }

    return {
      id: v.id,
      name,
      position: v.position,
      course: v.course,
      speed: v.speed,
      status: 'sailing' as const,
      destination,
      eta: `${14 + Math.floor(idx / 2)}:${(idx % 2) * 30 + 15}`,
      loadRate,
      laneId: v.laneId,
      progress: v.progress,
      trail
    };
  });
};

const generateSchedule = (): ScheduleItem[] => {
  const now = new Date();

  const lanes = [
    { id: 'xuwen-xinhai', name: '徐闻-新海' },
    { id: 'xuwen-xiuying', name: '徐闻-秀英' },
    { id: 'haian-xinhai', name: '海安-新海' },
    { id: 'haian-nangang', name: '海安-南港' }
  ];

  const schedule: ScheduleItem[] = [];
  let timeOffset = 0;

  for (let i = 0; i < 8; i++) {
    timeOffset += 30 + Math.floor(Math.random() * 16); // 30-45分钟间隔
    const scheduleTime = new Date(now.getTime() + timeOffset * 60000);
    const hour = scheduleTime.getHours();
    const minute = scheduleTime.getMinutes();

    const lane = lanes[i % lanes.length];
    const vesselName = VESSEL_NAMES[i % VESSEL_NAMES.length];
    const totalSlots = 180 + Math.floor(Math.random() * 60);
    const remainingSlots = Math.floor(totalSlots * (0.3 + Math.random() * 0.5));

    let status: 'waiting' | 'loading' | 'departed';
    if (i === 0) {
      status = 'loading';
    } else if (i === 1) {
      status = 'waiting';
    } else {
      status = 'waiting';
    }

    schedule.push({
      id: `schedule-${i}`,
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      lane: lane.name,
      vesselName,
      remainingSlots,
      totalSlots,
      status
    });
  }

  return schedule;
};

const generateQueue = (): QueueData => {
  const now = new Date();

  // 生成过去2小时到未来2小时的趋势数据（每15分钟一个点）
  const trend: Array<{ time: string; count: number }> = [];
  for (let i = -8; i < 8; i++) {
    const time = new Date(now.getTime() + i * 15 * 60000);
    const hour = time.getHours();
    const minute = time.getMinutes();

    // 模拟高峰低谷
    let baseCount = 800;
    if (hour >= 7 && hour <= 9) baseCount = 1500;
    else if (hour >= 14 && hour <= 16) baseCount = 1800;
    else if (hour >= 22 || hour <= 5) baseCount = 400;

    const count = baseCount + Math.floor(Math.random() * 200 - 100);

    trend.push({
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      count
    });
  }

  const totalVehicles = trend[8].count; // 当前时刻

  return {
    totalVehicles,
    estimatedWait: 45,
    trend,
    byType: {
      car: Math.floor(totalVehicles * 0.65),
      truck: Math.floor(totalVehicles * 0.28),
      hazmat: Math.floor(totalVehicles * 0.07)
    }
  };
};

const generateComparison = (): Record<'xuwen' | 'haian', PortComparison> => ({
  xuwen: {
    dailyTrips: 86,
    todayVolume: 12847,
    loadRate: 65,
    avgWait: 42
  },
  haian: {
    dailyTrips: 72,
    todayVolume: 9563,
    loadRate: 54,
    avgWait: 38
  }
});

const generateCrossingStats = (): CrossingStats => {
  // 24小时分布，模拟真实高峰低谷
  const hourlyDistribution = [
    320, 280, 240, 210, 190, 250,  // 0-5点 深夜低谷
    580, 920, 1150, 980, 850, 920, // 6-11点 早高峰
    1050, 1180, 1420, 1380, 1120, 980, // 12-17点 午后高峰
    850, 720, 650, 580, 480, 380   // 18-23点 晚间回落
  ];

  const todayTotal = hourlyDistribution.reduce((sum, val) => sum + val, 0);

  return {
    todayTotal,
    yoyChange: 8.3,
    hourlyDistribution,
    byType: {
      car: Math.floor(todayTotal * 0.62),
      truck: Math.floor(todayTotal * 0.31),
      bus: Math.floor(todayTotal * 0.07)
    }
  };
};

const generateWaitingAreas = (): WaitingArea[] => [
  {
    name: '徐闻港1号待渡区',
    capacity: 800,
    current: 523,
    byType: { car: 340, truck: 156, hazmat: 27 }
  },
  {
    name: '徐闻港2号待渡区',
    capacity: 600,
    current: 387,
    byType: { car: 245, truck: 118, hazmat: 24 }
  },
  {
    name: '海安新港待渡区',
    capacity: 500,
    current: 312,
    byType: { car: 198, truck: 95, hazmat: 19 }
  }
];

// ===== Zustand Store =====

export const usePortStore = create<PortState>((set) => ({
  straitIndex: generateStraitIndex(),
  weather: generateWeather(),
  portCapacity: {
    xuwen: generatePortCapacity('xuwen'),
    haian: generatePortCapacity('haian')
  },
  vessels: generateVessels(),
  schedule: generateSchedule(),
  queue: generateQueue(),
  comparison: generateComparison(),
  crossingStats: generateCrossingStats(),
  waitingAreas: generateWaitingAreas(),

  selectedVessel: null,
  selectedPort: null,

  setSelectedVessel: (id) => set({ selectedVessel: id }),
  setSelectedPort: (port) => set({ selectedPort: port }),
  updateVessels: (vessels) => set({ vessels }),
  updateStraitIndex: (index) => set({ straitIndex: index }),
  updateWeather: (weather) => set({ weather }),
  updateQueue: (queue) => set({ queue })
}));
