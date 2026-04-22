/**
 * 指挥模式地图坐标映射
 * 将语义地图的 SVG 坐标映射到真实地理坐标（WGS84）
 */

import { XUWEN_PORT, JINGANG_ROAD } from './map';

// SVG 坐标系边界（语义地图使用 1200x680）
const SVG_BOUNDS = {
  width: 1200,
  height: 680,
  minX: 0,
  maxX: 1200,
  minY: 0,
  maxY: 680,
};

// 真实地理坐标边界（WGS84，基于徐闻县实际范围）
const GEO_BOUNDS = {
  minLng: 110.130,
  maxLng: 110.190,
  minLat: 20.230,
  maxLat: 20.310,
};

/**
 * SVG 坐标 → WGS84 坐标转换
 * SVG Y轴向下，地理坐标Y轴向上，需要翻转
 */
export function svgToWgs84(x: number, y: number): [number, number] {
  const lng = GEO_BOUNDS.minLng + (x / SVG_BOUNDS.width) * (GEO_BOUNDS.maxLng - GEO_BOUNDS.minLng);
  const lat = GEO_BOUNDS.maxLat - (y / SVG_BOUNDS.height) * (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat);
  return [lng, lat];
}

// === 关键节点坐标映射 ===

export const COMMAND_NODES = {
  urbanGate: [110.160745, 20.306732] as [number, number],      // G207交叉口（城区入口）
  huasiGate: [110.157380, 20.291170] as [number, number],      // 华四村卡口
  maichenGate: [110.153524, 20.278910] as [number, number],    // 迈陈镇路口
  nanshanGate: [110.147502, 20.250149] as [number, number],    // 南山镇卡口
  s376Gate: svgToWgs84(604, 332),                              // S376路口（保持原有）
  laneControl: svgToWgs84(528, 244),                           // 借道起点（保持原有）
  xuwenPort: XUWEN_PORT,                                       // 徐闻港（保持原有）
  haianYard: svgToWgs84(672, 492),                             // 海安前场（保持原有）
  dispatchCenter: [110.136, 20.233] as [number, number],       // 调度中心
};

// === 人员位置映射（从 CommandMap.tsx 的 PERSON_POSITIONS） ===

export const PERSON_POSITIONS_GEO: Record<string, [number, number]> = {
  'p-01': svgToWgs84(612, 336),  // 警力 1
  'p-02': svgToWgs84(514, 452),  // 警力 2
  'p-03': svgToWgs84(558, 392),  // 拖车
};

// === 走廊路径关键点 ===

// G207 城区来车路径
export const G207_PATH: [number, number][] = [
  svgToWgs84(276, 182),
  svgToWgs84(390, 168),
  svgToWgs84(494, 190),
  svgToWgs84(560, 226),
];

// 进港大道压力链（使用真实坐标）
export const MAIN_PRESSURE_PATH = JINGANG_ROAD;

// S376 分流走廊路径
const huasiPos = JINGANG_ROAD[1];
export const S376_PATH: [number, number][] = [
  huasiPos,
  [huasiPos[0] - 0.018, huasiPos[1] - 0.015],
  [huasiPos[0] - 0.022, huasiPos[1] - 0.032],
  [huasiPos[0] - 0.016, huasiPos[1] - 0.042],
  XUWEN_PORT,
];

// 应急车道借用路径
export const EMERGENCY_LANE_PATH: [number, number][] = [
  svgToWgs84(528, 244),
  svgToWgs84(584, 302),
  svgToWgs84(570, 360),
  svgToWgs84(508, 444),
];

// === 流向路径 ===

// 港口积压反压（从徐闻港向北回压至近港区）
export const BACK_PRESSURE_PATH: [number, number][] = [
  XUWEN_PORT,
  [110.142, 20.238],
  [110.143228, 20.245138],  // 近港区
];

// 分流承接（从S376分流终点汇入近港区）
export const DIVERSION_RETURN_PATH: [number, number][] = [
  [huasiPos[0] - 0.016, huasiPos[1] - 0.032],
  [huasiPos[0] - 0.012, huasiPos[1] - 0.028],
  [110.143228, 20.245138],  // 近港区
];
