import { AlertTriangle } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';

const levelColorMap = {
  I: '#FF4757',
  II: '#FF6B35',
  III: '#F5A623',
  IV: '#00D0E9',
} as const;

export default function EmergencyBanner() {
  const emergency = useDashboardStore((s) => s.emergencyState);
  const color = levelColorMap[emergency.emergencyLevel];

  return (
    <div
      style={{
        height: 56,
        margin: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        borderRadius: 8,
        border: `1px solid ${color}66`,
        background: `linear-gradient(90deg, ${color}22 0%, rgba(10,15,25,0.96) 35%, rgba(10,15,25,0.96) 100%)`,
        boxShadow: `0 0 24px ${color}22`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <AlertTriangle size={18} color={color} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: color }}>{emergency.bannerTitle}</div>
          <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 2 }}>{emergency.bannerSubtitle}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>响应等级</div>
          <div style={{ fontSize: 18, fontWeight: 700, color }}>{emergency.emergencyLevel}级</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>当前阶段</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0' }}>{emergency.phaseLabel}</div>
        </div>
      </div>
    </div>
  );
}
