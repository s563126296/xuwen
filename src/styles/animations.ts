/**
 * Animation utilities and keyframes
 * 动画工具和关键帧
 */

import { CSSProperties } from 'react';

// ===== Fade Animations =====

export const fadeIn: CSSProperties = {
  animation: 'fadeIn 0.3s ease-in',
};

export const fadeOut: CSSProperties = {
  animation: 'fadeOut 0.3s ease-out',
};

// ===== Slide Animations =====

export const slideInFromRight: CSSProperties = {
  animation: 'slideInFromRight 0.3s ease-out',
};

export const slideInFromLeft: CSSProperties = {
  animation: 'slideInFromLeft 0.3s ease-out',
};

export const slideInFromTop: CSSProperties = {
  animation: 'slideInFromTop 0.3s ease-out',
};

export const slideInFromBottom: CSSProperties = {
  animation: 'slideInFromBottom 0.3s ease-out',
};

// ===== Pulse Animation =====

export const pulse: CSSProperties = {
  animation: 'pulse 2s ease-in-out infinite',
};

// ===== Glow Animation =====

export const glow: CSSProperties = {
  animation: 'glow 2s ease-in-out infinite',
};

// ===== Keyframes CSS =====

export const animationKeyframes = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes slideInFromRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes slideInFromLeft {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes slideInFromTop {
    from { transform: translateY(-100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes slideInFromBottom {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(0, 208, 233, 0.3); }
    50% { box-shadow: 0 0 20px rgba(0, 208, 233, 0.6); }
  }
`;

// ===== Transition Utilities =====

export const transition = {
  fast: 'all 0.15s ease',
  normal: 'all 0.3s ease',
  slow: 'all 0.5s ease',
};
