import { create } from 'zustand';
import { computeCauses, recommendStrategies } from '../utils/commandEngine';
import { useUIStore } from './uiStore';
import { useOverviewStore } from './overviewStore';
import type { AiSummaryAction } from './overviewStore';

type SystemMode = 'overview' | 'port' | 'command' | 'emergency' | 'analysis';
type PortType = 'xuwen' | 'haian' | 'overview';
type DirectionType = 'inbound' | 'outbound';

// === Command Mode Type Definitions ===

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
      position: [110.157380, 20.291170],
      status: 'executing',
      task: '执行 S-02 S376 分流',
      avatar: '#00D0E9',
    },
    {
      id: 'p-02',
      name: '李四',
      role: '交警',
      department: '交警一队',
      position: [110.147502, 20.250149],
      status: 'idle',
      task: undefined,
      avatar: '#2ED573',
    },
    {
      id: 'p-03',
      name: '王五',
      role: '拖车司机',
      department: '拖车公司',
      position: [110.153524, 20.278910],
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
  executionResources: {
    personnel: [
      { id: 'er-1', name: '张三', dept: '交警一队', status: 'executing', task: 'S376路口引导分流' },
      { id: 'er-2', name: '李四', dept: '交警一队', status: 'enroute', task: '前往应急车道执勤' },
      { id: 'er-3', name: '王五', dept: '拖车公司', status: 'enroute', task: '前往应急车道清障' },
      { id: 'er-4', name: '赵六', dept: '交警二队', status: 'standby', task: '待调度' },
    ],
    materials: [
      { name: '拖车', total: 2, ready: 1, unit: '台' },
      { name: '警力', total: 6, ready: 4, unit: '组' },
      { name: '锥桶', total: 20, ready: 20, unit: '个' },
      { name: '诱导屏', total: 3, ready: 2, unit: '块' },
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
};

// === Command Store Interface ===

interface CommandStoreState {
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
}

// === Command Store Implementation ===

export const useCommandStore = create<CommandStoreState>((set) => ({
  commandState: defaultCommandState,

  setCommandState: (data) => set((state) => ({
    commandState: { ...state.commandState, ...data },
  })),

  enterCommandMode: (action) => set((state) => {
    // Get overview data for cause computation
    const overviewState = useOverviewStore.getState();
    const engineSlice = {
      portDigestion: overviewState.portDigestion,
      tidalEffect: overviewState.tidalEffect,
      corridorPressure: overviewState.corridorPressure,
      weatherCoupling: overviewState.weatherCoupling,
      specialEvents: overviewState.specialEvents,
    };

    const causes = computeCauses(engineSlice);
    const strategies = recommendStrategies(causes, engineSlice);

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
        executionSteps: state.commandState.executionSteps.map((s) => ({ ...s, status: 'pending' as const })),
        actualIndex: null,
        currentStep: 1,
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
}));








