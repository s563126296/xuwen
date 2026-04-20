/**
 * UI/UX Pro Max Design System for Traffic Dashboard
 * 基于专业 UI/UX 建议的交通大屏设计系统
 */

// ===== Color System - OLED Dark Mode =====
export const COLORS_PROMAX = {
  // OLED Deep Black Background
  bg: {
    primary: '#000000',      // Pure black for OLED
    secondary: '#0A0E1A',    // Deep dark blue
    tertiary: '#121212',     // Dark grey
    card: 'rgba(18, 18, 18, 0.8)',
  },

  // Primary - Blue Data Visualization
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',  // Main primary
    600: '#2563EB',
    700: '#1E40AF',  // Design system primary
    800: '#1E3A8A',
    900: '#1E293B',
  },

  // CTA - Amber Highlights
  cta: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',  // Main CTA
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Real-Time Status Colors
  status: {
    critical: '#FF0000',    // Red - Critical alert
    warning: '#FFA500',     // Orange - Warning
    normal: '#22C55E',      // Green - Normal
    updating: '#3B82F6',    // Blue - Updating
  },

  // Traffic Status Colors
  traffic: {
    smooth: '#22C55E',      // Green - 畅通
    normal: '#3B82F6',      // Blue - 一般
    slow: '#F59E0B',        // Amber - 缓行
    congested: '#FB923C',   // Orange - 拥堵
    heavy: '#EF4444',       // Red - 严重拥堵
  },

  // Text Colors - High Contrast for OLED
  text: {
    primary: '#FFFFFF',
    secondary: '#E0E0E0',
    tertiary: '#A0A0A0',
    disabled: '#666666',
  },

  // Border Colors
  border: {
    primary: 'rgba(59, 130, 246, 0.3)',
    secondary: 'rgba(255, 255, 255, 0.1)',
    tertiary: 'rgba(255, 255, 255, 0.05)',
  },
} as const;

// ===== Typography - Fira Code + Fira Sans =====
export const TYPOGRAPHY_PROMAX = {
  fontFamily: {
    heading: "'Fira Code', 'JetBrains Mono', monospace",
    body: "'Fira Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'Fira Code', 'Consolas', monospace",
  },

  fontSize: {
    xs: '10px',
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

// ===== Animation System =====
export const ANIMATIONS_PROMAX = {
  // Duration - Following UX Guidelines
  duration: {
    fast: '150ms',
    base: '200ms',
    normal: '300ms',
    slow: '500ms',
  },

  // Easing
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Pulse for Live Indicators
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',

  // Glow for Alerts
  glow: 'glow 2s ease-in-out infinite',
} as const;

// ===== Effects - Minimal Glow for OLED =====
export const EFFECTS_PROMAX = {
  // Neon Glow (Minimal for OLED)
  glow: {
    primary: '0 0 10px rgba(59, 130, 246, 0.5)',
    cta: '0 0 10px rgba(245, 158, 11, 0.5)',
    critical: '0 0 10px rgba(255, 0, 0, 0.5)',
    success: '0 0 10px rgba(34, 197, 94, 0.5)',
  },

  // Shadows
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.6)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.6)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.7)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.8)',
  },

  // Backdrop Blur
  blur: {
    sm: 'blur(4px)',
    base: 'blur(8px)',
    md: 'blur(12px)',
    lg: 'blur(16px)',
  },
} as const;

// ===== Z-Index System - Following UX Guidelines =====
export const Z_INDEX_PROMAX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  notification: 80,
} as const;

// ===== Spacing System =====
export const SPACING_PROMAX = {
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
  20: '80px',
} as const;

// ===== Border Radius =====
export const RADIUS_PROMAX = {
  none: '0',
  sm: '4px',
  base: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const;

// ===== Chart Colors - For Data Visualization =====
export const CHART_COLORS_PROMAX = {
  // Line Chart Colors
  line: {
    primary: '#3B82F6',
    secondary: '#F59E0B',
    tertiary: '#22C55E',
    quaternary: '#EF4444',
  },

  // Area Chart with Opacity
  area: {
    primary: 'rgba(59, 130, 246, 0.2)',
    secondary: 'rgba(245, 158, 11, 0.2)',
    tertiary: 'rgba(34, 197, 94, 0.2)',
  },

  // Grid Lines
  grid: {
    primary: 'rgba(255, 255, 255, 0.05)',
    secondary: 'rgba(255, 255, 255, 0.02)',
  },
} as const;

// ===== Google Fonts Import =====
export const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap';

// ===== CSS Variables Export =====
export const CSS_VARIABLES = `
  --bg-primary: ${COLORS_PROMAX.bg.primary};
  --bg-secondary: ${COLORS_PROMAX.bg.secondary};
  --bg-tertiary: ${COLORS_PROMAX.bg.tertiary};

  --color-primary: ${COLORS_PROMAX.primary[500]};
  --color-primary-dark: ${COLORS_PROMAX.primary[700]};
  --color-cta: ${COLORS_PROMAX.cta[500]};

  --text-primary: ${COLORS_PROMAX.text.primary};
  --text-secondary: ${COLORS_PROMAX.text.secondary};

  --font-heading: ${TYPOGRAPHY_PROMAX.fontFamily.heading};
  --font-body: ${TYPOGRAPHY_PROMAX.fontFamily.body};

  --duration-fast: ${ANIMATIONS_PROMAX.duration.fast};
  --duration-base: ${ANIMATIONS_PROMAX.duration.base};
  --duration-normal: ${ANIMATIONS_PROMAX.duration.normal};

  --glow-primary: ${EFFECTS_PROMAX.glow.primary};
  --glow-cta: ${EFFECTS_PROMAX.glow.cta};

  --z-modal: ${Z_INDEX_PROMAX.modal};
  --z-notification: ${Z_INDEX_PROMAX.notification};
`;
