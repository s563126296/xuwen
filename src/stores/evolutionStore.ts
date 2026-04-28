import { create } from 'zustand';

export interface EvolutionRecord {
  version: string;      // v1.1, v1.2, ...
  date: string;         // ISO date string
  triggerEvent: string;  // What execution/feedback triggered this
  triggerExecutionId: string;
  changeDescription: string;
  affectedStrategies: string[];
  accuracyBefore: number;
  accuracyAfter: number;
}

interface EvolutionState {
  records: EvolutionRecord[];
  currentVersion: string;
  currentAccuracy: number;
  addRecord: (record: EvolutionRecord) => void;
}

// Pre-populated with mock evolution history matching the design spec
const INITIAL_RECORDS: EvolutionRecord[] = [
  {
    version: 'v1.0',
    date: '2026-04-15',
    triggerEvent: '基础模型上线',
    triggerExecutionId: '',
    changeDescription: '初始因子：拥堵指数/道路容量/时段/港口积压/历史数据/信号灯',
    affectedStrategies: ['S-01', 'S-02', 'S-04', 'S-05', 'S-07', 'S-09'],
    accuracyBefore: 0,
    accuracyAfter: 72,
  },
  {
    version: 'v1.1',
    date: '2026-04-22',
    triggerEvent: '大雾天分流效率仅 350 辆 vs 预期 500 辆',
    triggerExecutionId: 'exec-001',
    changeDescription: '+天气因子：大雾/雨天分流效率降低 30%',
    affectedStrategies: ['S-01', 'S-02'],
    accuracyBefore: 72,
    accuracyAfter: 76,
  },
  {
    version: 'v1.2',
    date: '2026-04-25',
    triggerEvent: '大货车占比 55% 导致分流速度慢',
    triggerExecutionId: 'exec-005',
    changeDescription: '+车型因子：大货车 >40% 时分流速度降低 25%',
    affectedStrategies: ['S-01', 'S-02', 'S-04'],
    accuracyBefore: 76,
    accuracyAfter: 79,
  },
  {
    version: 'v1.3',
    date: '2026-04-26',
    triggerEvent: 'S376 事故导致分流不达预期',
    triggerExecutionId: 'exec-008',
    changeDescription: '+路况因子：分流道路拥堵时自动降低预期',
    affectedStrategies: ['S-01', 'S-02', 'S-07'],
    accuracyBefore: 79,
    accuracyAfter: 82,
  },
  {
    version: 'v1.4',
    date: '2026-04-27',
    triggerEvent: '用户反馈 X699 县道汇入车流未纳入计算',
    triggerExecutionId: 'exec-012',
    changeDescription: '+汇入车流因子：汇入量 >200 辆/h 时降低分流效果预期',
    affectedStrategies: ['S-02', 'S-04', 'S-07'],
    accuracyBefore: 82,
    accuracyAfter: 86,
  },
];

export const useEvolutionStore = create<EvolutionState>((set) => ({
  records: INITIAL_RECORDS,
  currentVersion: 'v1.4',
  currentAccuracy: 86,

  addRecord: (record) => set((state) => ({
    records: [...state.records, record],
    currentVersion: record.version,
    currentAccuracy: record.accuracyAfter,
  })),
}));