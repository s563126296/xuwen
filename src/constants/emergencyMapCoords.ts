/**
 * 应急模式地图坐标常量
 * 基于徐闻港真实地理坐标（GCJ-02 高德坐标系）
 */

import { XUWEN_PORT, JINGANG_ROAD } from './map';

// ========== 真实路网 ==========

export const STRANDED_CHAIN_PATH = JINGANG_ROAD;

// G207 国道（城区来车路径）
export const G207_PATH: [number, number][] = [
  [110.177, 20.325],  // 徐城镇（县城）
  [110.170, 20.315],
  [110.165, 20.320],
  [110.163, 20.312],
  JINGANG_ROAD[0],    // G207 与 S548 交叉口
];

// 复航疏散路线（沿 S548 反向疏散至城区）
export const RECOVERY_PATH: [number, number][] = [
  XUWEN_PORT,
  JINGANG_ROAD[5],
  JINGANG_ROAD[4],
  JINGANG_ROAD[3],
  JINGANG_ROAD[2],
  JINGANG_ROAD[1],
  JINGANG_ROAD[0],
];

// 海安港分流路线（G207 东段）
export const HAIAN_DIVERSION_PATH: [number, number][] = [
  JINGANG_ROAD[0],    // G207 交叉口
  [110.175, 20.310],
  [110.195, 20.295],
  [110.215, 20.280],
  [110.226, 20.271],  // 海安港
];

// S376 省道东向分流
export const S376_EAST_PATH: [number, number][] = [
  JINGANG_ROAD[1],    // 华四村
  [110.165, 20.295],
  [110.177, 20.325],  // 徐城镇
];

// 应急车道（S548 反向借道，小客车专用）
export const EMERGENCY_LANE_PATH: [number, number][] = [
  JINGANG_ROAD[2],    // 迈陈镇
  JINGANG_ROAD[1],    // 华四村
  JINGANG_ROAD[0],    // G207 交叉口
];

// ========== 业务示意线 ==========

export const PARKING_TRANSFER_PATHS = {
  toP1: [JINGANG_ROAD[1], [110.155, 20.285] as [number, number]] as [number, number][],
  toP2: [JINGANG_ROAD[2], [110.152, 20.275] as [number, number]] as [number, number][],
  toP3: [JINGANG_ROAD[3], [110.149, 20.268] as [number, number]] as [number, number][],
};

export const SUPPLY_LINE_PATHS = {
  main: [
    [110.148, 20.255] as [number, number],
    JINGANG_ROAD[3],
    JINGANG_ROAD[4],
  ] as [number, number][],
  toParking: [
    [110.148, 20.255] as [number, number],
    [110.152, 20.275] as [number, number],
  ] as [number, number][],
};

export const DRONE_PATROL_PATH: [number, number][] = [
  [110.158, 20.295],
  [110.165, 20.290],
  [110.170, 20.275],
  [110.165, 20.260],
  [110.155, 20.255],
  [110.150, 20.265],
  [110.155, 20.280],
  [110.158, 20.295],
];

// ========== 关键节点 ==========

export const EMERGENCY_NODES = {
  xuwenPort: XUWEN_PORT,
  commandCenter: [110.177, 20.325] as [number, number],  // 徐城镇县城（修正：原坐标在海里）
  haianPort: [110.226, 20.271] as [number, number],       // 海安港

  // 停车场（3 个）
  parking1: [110.155, 20.285] as [number, number],  // P1 华四村，350 辆
  parking2: [110.152, 20.275] as [number, number],  // P2 迈陈镇，280 辆
  parking3: [110.149, 20.268] as [number, number],  // P3 中段，200 辆

  // 物资站
  supplyStation: [110.148, 20.255] as [number, number],  // 南山镇

  // 警力部署点
  policePoint1: [110.150, 20.265] as [number, number],   // 中段
  policePoint2: [110.153, 20.278] as [number, number],   // 迈陈镇
  policePoint3: JINGANG_ROAD[0] as [number, number],     // G207 交叉口

  // 医疗救援点
  medicalPoint: [110.147502, 20.250149] as [number, number],  // 南山镇

  // 无人机基地
  droneBase: [110.158, 20.295] as [number, number],

  // 加油站
  fuelStation: [110.150, 20.265] as [number, number],

  // 路段节点
  g207Gate: JINGANG_ROAD[0],
  huasiVillage: JINGANG_ROAD[1],
  maichenTown: JINGANG_ROAD[2],
  midSection: JINGANG_ROAD[3],
  nanshanTown: JINGANG_ROAD[4],
  nearPort: JINGANG_ROAD[5],
};

// ========== 台风路径 ==========

export const TYPHOON_PATH: [number, number][] = [
  [110.280, 20.150],
  [110.240, 20.170],
  [110.200, 20.190],
  [110.160, 20.210],
  XUWEN_PORT,
];

// ========== 特殊车辆位置 ==========

export const VEHICLE_POSITIONS_GEO: Record<string, [number, number]> = {
  'sv-1': [110.159, 20.300],
  'sv-2': [110.156, 20.288],
  'sv-3': [110.153, 20.276],
  'sv-4': [110.150, 20.262],
  'sv-5': [110.147, 20.248],
  'sv-6': [110.144, 20.240],
};
