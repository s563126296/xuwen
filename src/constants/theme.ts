/**
 * Theme constants for Xuwen Smart Traffic Dashboard
 * 徐闻智慧交通大屏主题常量
 */

// Primary colors
export const COLORS = {
  // Background
  BG_PRIMARY: '#0A0F19',
  BG_SECONDARY: '#0D1B2A',
  BG_CARD: 'rgba(13, 27, 42, 0.5)',

  // Primary brand colors
  PRIMARY: '#00D0E9',      // Cyan - 青色
  ACCENT: '#F5A623',       // Orange - 橙色
  SUCCESS: '#2ED573',      // Green - 绿色
  DANGER: '#FF4757',       // Red - 红色
  WARNING: '#FF8C00',      // Dark orange - 深橙色

  // Extended palette
  CRITICAL: '#DC143C',     // Crimson - 深红色
  INFO: '#00D0E9',         // Same as primary

  // Text colors
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: '#94A3B8',
  TEXT_MUTED: '#64748B',

  // Border colors
  BORDER_PRIMARY: 'rgba(0, 208, 233, 0.15)',
  BORDER_SECONDARY: 'rgba(255, 255, 255, 0.1)',
} as const;

// Traffic status colors
export const TRAFFIC_STATUS_COLORS = {
  SMOOTH: COLORS.SUCCESS,        // 畅通
  NORMAL: COLORS.PRIMARY,        // 一般
  LIGHT_CONGESTION: COLORS.ACCENT,  // 轻度拥堵
  MODERATE_CONGESTION: COLORS.WARNING,  // 中度拥堵
  HEAVY_CONGESTION: COLORS.DANGER,  // 重度拥堵
} as const;

// Opacity levels
export const OPACITY = {
  FULL: 1.0,
  HIGH: 0.9,
  MEDIUM: 0.7,
  LOW: 0.5,
  VERY_LOW: 0.3,
} as const;
