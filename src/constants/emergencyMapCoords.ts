/**
 * 应急模式地图坐标常量
 * 基于徐闻港真实地理坐标（GCJ-02 高德坐标系）
 *
 * 完整应急故事：台风"摩羯"导致琼州海峡停航 48 小时
 * 峰值滞留 3,200 辆车，滞留链延伸至 G207 交叉口（全程 8.5km）
 */

import { XUWEN_PORT, JINGANG_ROAD } from './map';

// ========== 真实路网（必须贴合实际道路）==========

// S548 进港大道（真实采集点，用户确认）
export const STRANDED_CHAIN_PATH = JINGANG_ROAD;

// G207 国道（城区来车路径）
export const G207_PATH: [number, number][] = [
  [110.165, 20.320],  // 北端（城区方向）
  [110.163, 20.312],
  JINGANG_ROAD[0],    // 与 S548 交叉口
];

// 复航疏散方向（沿 S548 进港大道反向疏散至城区）
export const RECOVERY_PATH: [number, number][] = [
  XUWEN_PORT,           // 起点: 徐闻港
  JINGANG_ROAD[5],      // 近港区
  JINGANG_ROAD[4],      // 南山镇
  JINGANG_ROAD[3],      // 中段
  JINGANG_ROAD[2],      // 迈陈镇
  JINGANG_ROAD[1],      // 华四村
  JINGANG_ROAD[0],      // 终点: G207 交叉口（城区入口）
];

// ========== 业务示意线（不要求严格贴合路网）==========

// 停车区分拨线路径（从主干道到停车场的示意线）
export const PARKING_TRANSFER_PATHS = {
  toP1: [
    JINGANG_ROAD[1],  // 从华四村
    [110.155, 20.285] as [number, number],  // P1 停车场
  ] as [number, number][],
  toP2: [
    JINGANG_ROAD[2],  // 从迈陈镇
    [110.152, 20.275] as [number, number],  // P2 停车场
  ] as [number, number][],
  toP3: [
    JINGANG_ROAD[3],  // 从中段
    [110.149, 20.268] as [number, number],  // P3 应急停车区
  ] as [number, number][],
};

// 物资配送线路径（从物资站到各发放点的示意线）
export const SUPPLY_LINE_PATHS = {
  main: [
    [110.148, 20.255] as [number, number],  // 南山镇物资站
    JINGANG_ROAD[3],  // 中段
    JINGANG_ROAD[4],  // 南山镇
  ] as [number, number][],
  toParking: [
    [110.148, 20.255] as [number, number],  // 南山镇物资站
    [110.152, 20.275] as [number, number],  // P2 停车场
  ] as [number, number][],
};

// 无人机巡查闭环路径（8 个点，全程 12km，示意线）
export const DRONE_PATROL_PATH: [number, number][] = [
  [110.158, 20.295],  // 无人机基地
  [110.165, 20.290],
  [110.170, 20.275],
  [110.165, 20.260],
  [110.155, 20.255],
  [110.150, 20.265],
  [110.155, 20.280],
  [110.158, 20.295],  // 回到基地
];

// ========== 关键节点坐标 ==========

export const EMERGENCY_NODES = {
  // 徐闻港（停航影响中心）
  xuwenPort: XUWEN_PORT,

  // 县应急指挥中心（县城区域）
  commandCenter: [110.136, 20.233] as [number, number],

  // 停车场（3 个）
  parking1: [110.155, 20.285] as [number, number],  // P1 停车场（华四村附近，容量 350 辆）
  parking2: [110.152, 20.275] as [number, number],  // P2 停车场（迈陈镇附近，容量 280 辆）
  parking3: [110.149, 20.268] as [number, number],  // P3 应急停车区（中段，容量 200 辆）

  // 物资站
  supplyStation: [110.148, 20.255] as [number, number],  // 南山镇物资站

  // 警力部署点（2 个）
  policePoint1: [110.150, 20.265] as [number, number],  // 中段执勤点
  policePoint2: [110.153, 20.278] as [number, number],  // 迈陈镇执勤点

  // 无人机起降点
  droneBase: [110.158, 20.295] as [number, number],  // 北段无人机基地

  // 加油站（移动加油车初始位置）
  fuelStation: [110.150, 20.265] as [number, number],

  // G207 交叉口（北端，滞留链起点）
  g207Gate: JINGANG_ROAD[0],

  // 关键路段节点
  huasiVillage: JINGANG_ROAD[1],    // 华四村
  maichenTown: JINGANG_ROAD[2],     // 迈陈镇
  midSection: JINGANG_ROAD[3],      // 中段
  nanshanTown: JINGANG_ROAD[4],     // 南山镇
  nearPort: JINGANG_ROAD[5],        // 近港区
};

// ========== 台风相关坐标 ==========

// 台风预测路径关键点（从东南向西北移动，共 5 个点）
export const TYPHOON_PATH: [number, number][] = [
  [110.280, 20.150],  // T-6h: 起点，东南海域，距离 85km
  [110.240, 20.170],  // T-3h: 中间点1，距离 65km
  [110.200, 20.190],  // T0: 中间点2，距离 45km，停航开始
  [110.160, 20.210],  // T+2h: 中间点3，距离 25km
  XUWEN_PORT,         // T+6h: 终点，台风登陆徐闻港
];

// ========== 特殊车辆位置（沿滞留链分布，6 辆）==========

export const VEHICLE_POSITIONS_GEO: Record<string, [number, number]> = {
  'sv-1': [110.159, 20.300],  // 北段（冷链车）
  'sv-2': [110.156, 20.288],  // 华四村附近（危化品车）
  'sv-3': [110.153, 20.276],  // 迈陈镇附近（冷链车）
  'sv-4': [110.150, 20.262],  // 中段（锂电池车）
  'sv-5': [110.147, 20.248],  // 南山镇附近（冷链车，红色预警）
  'sv-6': [110.144, 20.240],  // 近港区（危化品车）
};

// ========== 海域标注位置 ==========

export const SEA_LABELS = {
  strait: [110.165, 20.200] as [number, number],  // 琼州海峡中心
  haikouCoast: [110.190, 20.180] as [number, number],  // 海口方向
};

// ========== 停车场容量配置 ==========

export const PARKING_CAPACITY = {
  p1: 350,  // P1 停车场容量
  p2: 280,  // P2 停车场容量
  p3: 200,  // P3 应急停车区容量
};

// ========== 物资站库存配置 ==========

export const SUPPLY_INVENTORY = {
  meals: 5000,   // 盒饭初始库存
  water: 800,    // 饮水初始库存（箱）
  fuel: 3500,    // 燃油储备（升）
};
