/**
 * Common style objects for reuse across components
 * 通用样式对象，供组件复用
 */

import { CSSProperties } from 'react';
import { COLORS } from '../constants/theme';

// ===== Card Styles =====

export const cardBase: CSSProperties = {
  padding: 12,
  borderRadius: 6,
  background: 'rgba(13, 27, 42, 0.5)',
  border: '1px solid rgba(0, 208, 233, 0.15)',
};

export const cardHeader: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 8,
};

export const cardTitle: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: COLORS.PRIMARY,
};

// ===== Panel Styles =====

export const panelBase: CSSProperties = {
  background: 'rgba(13, 27, 42, 0.8)',
  border: '1px solid rgba(0, 208, 233, 0.2)',
  borderRadius: 8,
  padding: 16,
};

export const panelHeader: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: '1px solid rgba(0, 208, 233, 0.1)',
};

export const panelTitle: CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: COLORS.PRIMARY,
};

// ===== Button Styles =====

export const buttonBase: CSSProperties = {
  padding: '6px 12px',
  borderRadius: 4,
  border: 'none',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 500,
  transition: 'all 0.2s',
};

export const buttonPrimary: CSSProperties = {
  ...buttonBase,
  background: COLORS.PRIMARY,
  color: '#0A0F19',
};

export const buttonSecondary: CSSProperties = {
  ...buttonBase,
  background: 'rgba(0, 208, 233, 0.1)',
  color: COLORS.PRIMARY,
  border: `1px solid ${COLORS.PRIMARY}`,
};

export const buttonDanger: CSSProperties = {
  ...buttonBase,
  background: COLORS.DANGER,
  color: '#FFFFFF',
};

export const buttonGhost: CSSProperties = {
  ...buttonBase,
  background: 'transparent',
  color: COLORS.TEXT_SECONDARY,
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

// ===== Badge Styles =====

export const badgeBase: CSSProperties = {
  padding: '2px 8px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 600,
};

export const badgeSuccess: CSSProperties = {
  ...badgeBase,
  background: 'rgba(46, 213, 115, 0.15)',
  color: COLORS.SUCCESS,
};

export const badgeWarning: CSSProperties = {
  ...badgeBase,
  background: 'rgba(245, 166, 35, 0.15)',
  color: COLORS.ACCENT,
};

export const badgeDanger: CSSProperties = {
  ...badgeBase,
  background: 'rgba(255, 71, 87, 0.15)',
  color: COLORS.DANGER,
};

export const badgeInfo: CSSProperties = {
  ...badgeBase,
  background: 'rgba(0, 208, 233, 0.15)',
  color: COLORS.PRIMARY,
};

// ===== Modal Styles =====

export const modalOverlay: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

export const modalContent: CSSProperties = {
  background: '#0D1B2A',
  border: '1px solid rgba(0, 208, 233, 0.3)',
  borderRadius: 8,
  padding: 24,
  maxWidth: '90vw',
  maxHeight: '90vh',
  overflow: 'auto',
};

export const modalHeader: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 16,
  paddingBottom: 12,
  borderBottom: '1px solid rgba(0, 208, 233, 0.2)',
};

export const modalTitle: CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: COLORS.PRIMARY,
};

// ===== Input Styles =====

export const inputBase: CSSProperties = {
  padding: '8px 12px',
  borderRadius: 4,
  border: '1px solid rgba(0, 208, 233, 0.3)',
  background: 'rgba(13, 27, 42, 0.5)',
  color: COLORS.TEXT_PRIMARY,
  fontSize: 13,
  outline: 'none',
};

export const selectBase: CSSProperties = {
  ...inputBase,
  cursor: 'pointer',
};

// ===== Text Styles =====

export const textPrimary: CSSProperties = {
  color: COLORS.TEXT_PRIMARY,
  fontSize: 13,
};

export const textSecondary: CSSProperties = {
  color: COLORS.TEXT_SECONDARY,
  fontSize: 12,
};

export const textMuted: CSSProperties = {
  color: COLORS.TEXT_MUTED,
  fontSize: 11,
};

export const textLabel: CSSProperties = {
  fontSize: 11,
  color: COLORS.TEXT_SECONDARY,
  fontWeight: 500,
};

export const textValue: CSSProperties = {
  fontSize: 14,
  color: COLORS.TEXT_PRIMARY,
  fontWeight: 600,
};

// ===== Layout Styles =====

export const flexRow: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
};

export const flexColumn: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

export const flexCenter: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const flexBetween: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

// ===== Divider Styles =====

export const dividerHorizontal: CSSProperties = {
  height: 1,
  background: 'rgba(0, 208, 233, 0.1)',
  margin: '12px 0',
};

export const dividerVertical: CSSProperties = {
  width: 1,
  background: 'rgba(0, 208, 233, 0.1)',
  margin: '0 12px',
};

// ===== Scrollbar Styles =====

export const scrollbarStyles = `
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: rgba(13, 27, 42, 0.5);
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(0, 208, 233, 0.3);
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 208, 233, 0.5);
  }
`;
