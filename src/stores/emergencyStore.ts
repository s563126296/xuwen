import { create } from 'zustand';
import { getEmergencyLevel, buildEmergencyTimeline, PHASE_LABELS, generateTasksFromPlan } from '../utils/emergencyEngine';
import { getPlanById } from '../data/emergencyPlans';

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
  status: 'pending' | 'received' | 'executing' | 'arrived' | 'done';
  owner: string;
  updatedAt: string;
  arrivedAt?: string;
  completedAt?: string;
}

export interface EmergencyResourcePoint {
  id: string;
  type: 'parking' | 'supply' | 'personnel' | 'drone' | 'fuel';
  name: string;
  position: [number, number];
  status: 'normal' | 'warning' | 'critical';
  detail: string;
}

export interface FieldResource {
  id: string;
  type: 'personnel' | 'vehicle' | 'equipment';
  name: string;
  department: EmergencyTask['department'];
  status: 'standby' | 'dispatched' | 'arrived' | 'working' | 'offline';
  position?: [number, number];
  assignedTask?: string;
  lastUpdate: string;
  detail: string;
}

export interface SpecialVehicleDetail {
  id: string;
  plateNumber: string;
  type: 'cold_chain' | 'hazardous' | 'lithium_battery';
  position: [number, number];
  strandedSince: string;
  strandedHours: number;
  alertLevel: 'normal' | 'yellow' | 'orange' | 'red';
  cargoType?: string;
  driverPhone?: string;
  fuelLevel?: number;
  notes?: string;
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
  target?: string;
  time: string;
  content: string;
  urgent?: boolean;
  mentions?: string[];
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
  fieldResources: FieldResource[];
  specialVehicles: SpecialVehicleDetail[];
  timeline: EmergencyTimelinePoint[];
  communications: EmergencyCommItem[];
  contacts: EmergencyContact[];
  activePlan: ActivePlanExecution | null;
  activeVideoChannel: number;
  isDroneDeployed: boolean;
  videoConference: {
    active: boolean;
    participants: string[];
    startTime: string | null;
    isMinimized: boolean;
  } | null;
  typhoon: {
    name: string;
    distance: number;
    windLevel: number;
    windSpeed: number;
    rainfall: number;
    visibility: number;
    direction: string;
    speed: number;
    landingTime: string;
    warningLevel: '蓝色' | '黄色' | '橙色' | '红色';
  };
}

interface EmergencyStoreState {
  emergencyState: EmergencyState;
  setEmergencyState: (data: Partial<EmergencyState>) => void;
  activatePlan: (planId: PlanId) => void;
  advancePlanPhase: (newPhase: EmergencyPhase) => void;
  setEmergencyVideoChannel: (channel: number) => void;
  deployEmergencyDrone: () => void;
  recallEmergencyDrone: () => void;
  startVideoConference: (participantIds: string[]) => void;
  endVideoConference: () => void;
}

const defaultEmergencyState: EmergencyState = {
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
  fieldResources: [
    { id: 'fr-1', type: 'personnel', name: '王队长', department: '公安交警', status: 'working', position: [110.1538, 20.279], assignedTask: 'em-task-1', lastUpdate: '15:02', detail: '进港大道执勤' },
    { id: 'fr-2', type: 'personnel', name: '李警官', department: '公安交警', status: 'working', position: [110.1542, 20.281], assignedTask: 'em-task-1', lastUpdate: '15:02', detail: '进港大道执勤' },
    { id: 'fr-3', type: 'personnel', name: '张主任', department: '民政局', status: 'standby', lastUpdate: '15:05', detail: '物资调配中' },
    { id: 'fr-4', type: 'vehicle', name: '粤G·L5827 物资运输车', department: '民政局', status: 'dispatched', lastUpdate: '15:10', detail: '运送盒饭至发放点' },
    { id: 'fr-5', type: 'vehicle', name: '粤G·J9163 移动加油车', department: '交通运输局', status: 'standby', lastUpdate: '15:00', detail: '待命中' },
    { id: 'fr-6', type: 'equipment', name: 'DJI M300 无人机', department: '公安交警', status: 'working', position: [110.1574, 20.2911], lastUpdate: '15:15', detail: '巡查中' },
  ],
  specialVehicles: [
    { id: 'sv-1', plateNumber: '粤G·K7823', type: 'cold_chain', position: [110.1468, 20.245], strandedSince: '14:35', strandedHours: 0.5, alertLevel: 'normal', cargoType: '冷冻海鲜', driverPhone: '13726581903', fuelLevel: 85 },
    { id: 'sv-2', plateNumber: '琼A·D3156', type: 'cold_chain', position: [110.1472, 20.247], strandedSince: '08:20', strandedHours: 7, alertLevel: 'yellow', cargoType: '冷冻肉类', driverPhone: '18976342087', fuelLevel: 42 },
    { id: 'sv-3', plateNumber: '粤B·W9471', type: 'cold_chain', position: [110.1580, 20.290], strandedSince: '02:15', strandedHours: 13, alertLevel: 'orange', cargoType: '疫苗运输', driverPhone: '13590267841', fuelLevel: 28, notes: '优先保障' },
    { id: 'sv-4', plateNumber: '桂C·M6038', type: 'cold_chain', position: [110.1510, 20.265], strandedSince: '昨日 14:30', strandedHours: 25, alertLevel: 'red', cargoType: '冷冻水产', driverPhone: '15277834562', fuelLevel: 15, notes: '燃油告急' },
    { id: 'sv-5', plateNumber: '粤G·T2597', type: 'hazardous', position: [110.1485, 20.252], strandedSince: '10:40', strandedHours: 4.5, alertLevel: 'normal', cargoType: '易燃液体', driverPhone: '13692478305' },
    { id: 'sv-6', plateNumber: '琼B·H8164', type: 'hazardous', position: [110.1520, 20.268], strandedSince: '12:10', strandedHours: 3, alertLevel: 'normal', cargoType: '腐蚀性物品', driverPhone: '18089763241' },
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
  activeVideoChannel: 0,
  isDroneDeployed: false,
  videoConference: null,
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
};

export const useEmergencyStore = create<EmergencyStoreState>((set) => ({
  emergencyState: defaultEmergencyState,

  setEmergencyState: (data) => set((state) => ({
    emergencyState: { ...state.emergencyState, ...data },
  })),

  activatePlan: (planId) => {
    const plan = getPlanById(planId);
    if (!plan) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentPhase = useEmergencyStore.getState().emergencyState.forecast.strandedPhase;
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

  setEmergencyVideoChannel: (channel) => set((state) => ({
    emergencyState: { ...state.emergencyState, activeVideoChannel: channel },
  })),

  deployEmergencyDrone: () => set((state) => ({
    emergencyState: { ...state.emergencyState, isDroneDeployed: true, activeVideoChannel: 5 },
  })),

  recallEmergencyDrone: () => set((state) => ({
    emergencyState: { ...state.emergencyState, isDroneDeployed: false, activeVideoChannel: 0 },
  })),

  startVideoConference: (participantIds) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    set((state) => ({
      emergencyState: {
        ...state.emergencyState,
        videoConference: { active: true, participants: participantIds, startTime: timeStr, isMinimized: false },
        communications: [
          ...state.emergencyState.communications,
          { id: `ec-vc-${Date.now()}`, type: 'system' as const, source: '系统', time: timeStr, content: `视频会商已开启，${participantIds.length} 人参会`, urgent: false },
        ],
      },
    }));
  },

  endVideoConference: () => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    set((state) => ({
      emergencyState: {
        ...state.emergencyState,
        videoConference: null,
        communications: [
          ...state.emergencyState.communications,
          { id: `ec-vc-end-${Date.now()}`, type: 'system' as const, source: '系统', time: timeStr, content: '视频会商已结束', urgent: false },
        ],
      },
    }));
  },
}));
