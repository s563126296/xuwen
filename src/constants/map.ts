/**
 * Map constants for Xuwen Smart Traffic Dashboard
 * 徐闻智慧交通大屏地图常量
 */

import { COLORS, OPACITY } from './theme';

// Xuwen Port coordinates (Amap GCJ-02, user confirmed)
// 徐闻港精确坐标（高德GCJ-02，用户确认）
export const XUWEN_PORT: [number, number] = [110.141114, 20.233385];

// Jingang Road key points (from north to south)
// 进港公路采集坐标（用户提供的原始 7 个关键点，从北到南）
export const JINGANG_ROAD_ORIGINAL: [number, number][] = [
  [110.160745, 20.306732],  // 北端 G207 交叉口
  [110.157380, 20.291170],  // 华四村
  [110.153524, 20.278910],  // 迈陈镇
  [110.150478, 20.264358],  // 中段
  [110.147502, 20.250149],  // 南山镇
  [110.143228, 20.245138],  // 近港区
  [110.141114, 20.233385],  // 徐闻港
];

// Currently using original coordinates, waiting for denser real collection points
// 临时使用原始坐标，等待用户提供更密集的真实采集点
export const JINGANG_ROAD = JINGANG_ROAD_ORIGINAL;

// Congestion level increases from north to south (closer to port = more congested)
// 拥堵程度从北到南递增（越靠近港口越堵）
export const SEGMENT_STYLES = [
  { color: COLORS.SUCCESS, weight: 4, opacity: OPACITY.MEDIUM },  // 北端：畅通
  { color: COLORS.ACCENT, weight: 6, opacity: OPACITY.HIGH },     // 华四村：缓行
  { color: COLORS.WARNING, weight: 8, opacity: 0.8 },             // 迈陈镇：拥堵
  { color: COLORS.DANGER, weight: 10, opacity: OPACITY.HIGH },    // 中段：严重拥堵
  { color: COLORS.DANGER, weight: 12, opacity: OPACITY.FULL },    // 南山镇：严重拥堵
  { color: COLORS.CRITICAL, weight: 14, opacity: OPACITY.FULL },  // 近港区：极度拥堵
] as const;

// Particle animation configuration
// 粒子配置
export const PARTICLE_CONFIG = {
  COUNT: 6,
  INTERVAL: 80, // ms
} as const;
