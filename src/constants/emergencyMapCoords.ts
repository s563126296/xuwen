/**
 * 应急模式地图坐标常量
 * 基于徐闻港真实地理坐标（GCJ-02 高德坐标系）
 */

import { XUWEN_PORT, JINGANG_ROAD } from './map';

// === 关键节点坐标 ===

export const EMERGENCY_NODES = {
  // 徐闻港（停航影响中心）
  xuwenPort: XUWEN_PORT,

  // 县应急指挥中心（县城区域）
  commandCenter: [110.136, 20.233] as [number, number],

  // 停车场
  parking1: [110.155, 20.285] as [number, number],  // P1 停车场（华四村附近）
  parking2: [110.152, 20.275] as [number, number],  // P2 停车场（迈陈镇附近）

  // 物资站
  supplyStation: [110.148, 20.255] as [number, number],  // 南山镇物资站

  // 警力部署点
  policeStation: [110.150, 20.265] as [number, number],  // 中段警力

  // 无人机起降点
  droneBase: [110.158, 20.295] as [number, number],  // 北段无人机基地
};

// === 台风相关坐标 ===

// 台风初始位置（东南海域）
export const TYPHOON_START: [number, number] = [110.280, 20.150];

// 台风预测路径关键点（从东南向西北移动）
export const TYPHOON_PATH: [number, number][] = [
  [110.280, 20.150],  // 起点：东南海域
  [110.240, 20.170],  // 中间点1
  [110.200, 20.190],  // 中间点2
  [110.160, 20.210],  // 中间点3
  XUWEN_PORT,         // 终点：徐闻港
];

// === 走廊路径 ===

// S548 进港大道滞留链（使用真实坐标）
export const STRANDED_CHAIN_PATH = JINGANG_ROAD;

// 停车区分拨线路径
export const PARKING_TRANSFER_PATHS = {
  toP1: [
    JINGANG_ROAD[1],  // 从华四村
    EMERGENCY_NODES.parking1,
  ] as [number, number][],
  toP2: [
    JINGANG_ROAD[2],  // 从迈陈镇
    EMERGENCY_NODES.parking2,
  ] as [number, number][],
};

// 物资配送线路径
export const SUPPLY_LINE_PATHS = {
  main: [
    EMERGENCY_NODES.supplyStation,
    JINGANG_ROAD[3],  // 中段
    JINGANG_ROAD[4],  // 南山镇
  ] as [number, number][],
  toParking: [
    EMERGENCY_NODES.supplyStation,
    EMERGENCY_NODES.parking2,
  ] as [number, number][],
};

// 无人机巡查闭环路径
export const DRONE_PATROL_PATH: [number, number][] = [
  EMERGENCY_NODES.droneBase,
  [110.165, 20.290],
  [110.170, 20.275],
  [110.165, 20.260],
  [110.155, 20.255],
  [110.150, 20.265],
  [110.155, 20.280],
  EMERGENCY_NODES.droneBase,
];

// === 特殊车辆位置（沿滞留链分布）===

export const VEHICLE_POSITIONS_GEO: Record<string, [number, number]> = {
  'sv-1': [110.159, 20.300],  // 北段
  'sv-2': [110.156, 20.288],  // 华四村附近
  'sv-3': [110.153, 20.276],  // 迈陈镇附近
  'sv-4': [110.150, 20.262],  // 中段
  'sv-5': [110.147, 20.248],  // 南山镇附近
  'sv-6': [110.144, 20.240],  // 近港区
};

// === 复航疏散方向 ===

export const RECOVERY_PATH: [number, number][] = [
  XUWEN_PORT,
  [110.155, 20.245],
  [110.170, 20.260],
  [110.190, 20.280],  // 向东北疏散
];

// === 海域标注位置 ===

export const SEA_LABELS = {
  strait: [110.165, 20.200] as [number, number],  // 琼州海峡中心
  haikouCoast: [110.190, 20.180] as [number, number],  // 海口方向
};
