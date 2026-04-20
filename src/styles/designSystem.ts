/**
 * Enhanced Design System - Modern Traffic Dashboard
 * 现代化交通大屏设计系统
 */

import { CSSProperties } from 'react';

// ===== Color Palette - 优化配色方案 =====

export const COLORS_V2 = {
  // 主色调 - 科技蓝
  primary: {
    50: '#E6F7FF',
    100: '#BAE7FF',
    200: '#91D5FF',
    300: '#69C0FF',
    400: '#40A9FF',
    500: '#1890FF',  // 主色
    600: '#096DD9',
    700: '#0050B3',
    800: '#003A8C',
    900: '#002766',
  },

  // 辅助色 - 青色
  cyan: {
    50: '#E6FFFB',
    100: '#B5F5EC',
    200: '#87E8DE',
    300: '#5CDBD3',
    400: '#36CFC9',
    500: '#13C2C2',  // 主辅助色
    600: '#08979C',
    700: '#006D75',
    800: '#00474F',
    900: '#002329',
  },

  // 状态色
  success: '#52C41A',
  warning: '#FAAD14',
  error: '#F5222D',
  info: '#1890FF',

  // 交通状态色（优化）
  traffic: {
    smooth: '#52C41A',      // 畅通 - 绿色
    normal: '#13C2C2',      // 一般 - 青色
    slow: '#FAAD14',        // 缓行 - 橙色
    congested: '#FA8C16',   // 拥堵 - 深橙
    heavy: '#F5222D',       // 严重拥堵 - 红色
  },

  // 背景色
  bg: {
    primary: '#0A0E1A',     // 主背景
    secondary: '#141824',   // 次级背景
    tertiary: '#1F2937',    // 三级背景
    card: 'rgba(20, 24, 36, 0.8)',  // 卡片背景
    glass: 'rgba(20, 24, 36, 0.6)', // 玻璃态背景
  },

  // 文字色
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.85)',
    tertiary: 'rgba(255, 255, 255, 0.65)',
    disabled: 'rgba(255, 255, 255, 0.45)',
  },

  // 边框色
  border: {
    primary: 'rgba(24, 144, 255, 0.3)',
    secondary: 'rgba(255, 255, 255, 0.15)',
    tertiary: 'rgba(255, 255, 255, 0.08)',
  },
} as const;

// ===== Typography - 字体系统 =====

export const TYPOGRAPHY = {
  fontFamily: {
    base: "'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'JetBrains Mono', 'Consolas', monospace",
    display: "'Orbitron', 'Inter', sans-serif",
  },

  fontSize: {
    xs: '11px',
    sm: '12px',
    base: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '32px',
    '5xl': '40px',
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ===== Spacing - 间距系统 =====

export const SPACING = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const;

// ===== Border Radius - 圆角系统 =====

export const RADIUS = {
  none: '0',
  sm: '4px',
  base: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const;

// ===== Shadows - 阴影系统 =====

export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

  // 发光效果
  glow: {
    primary: '0 0 20px rgba(24, 144, 255, 0.3)',
    cyan: '0 0 20px rgba(19, 194, 194, 0.3)',
    success: '0 0 20px rgba(82, 196, 26, 0.3)',
    warning: '0 0 20px rgba(250, 173, 20, 0.3)',
    error: '0 0 20px rgba(245, 34, 45, 0.3)',
  },
} as const;

// ===== Glassmorphism - 玻璃态效果 =====

export const glassEffect: CSSProperties = {
  background: 'rgba(20, 24, 36, 0.6)',
  backdropFilter: 'blur(12px) saturate(180%)',
  WebkitBackdropFilter: 'blur(12px) saturate(180%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

export const glassEffectStrong: CSSProperties = {
  background: 'rgba(20, 24, 36, 0.8)',
  backdropFilter: 'blur(20px) saturate(200%)',
  WebkitBackdropFilter: 'blur(20px) saturate(200%)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
};

// ===== Gradients - 渐变效果 =====

export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #1890FF 0%, #096DD9 100%)',
  cyan: 'linear-gradient(135deg, #13C2C2 0%, #08979C 100%)',
  success: 'linear-gradient(135deg, #52C41A 0%, #389E0D 100%)',
  warning: 'linear-gradient(135deg, #FAAD14 0%, #D48806 100%)',
  error: 'linear-gradient(135deg, #F5222D 0%, #CF1322 100%)',

  // 背景渐变
  bgDark: 'linear-gradient(180deg, #0A0E1A 0%, #141824 100%)',
  bgCard: 'linear-gradient(135deg, rgba(20, 24, 36, 0.8) 0%, rgba(31, 41, 55, 0.6) 100%)',

  // 光泽效果
  shine: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)',
} as const;

// ===== Animations - 动画配置 =====

export const ANIMATIONS = {
  duration: {
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
  },

  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

// ===== Z-Index - 层级系统 =====

export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;
