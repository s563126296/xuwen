import { AlertTriangle, Wind, CloudRain, Eye, Navigation } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import type { EmergencyPhase } from '../../store/dashboardStore';
import { PHASE_LABELS } from '../../utils/emergencyEngine';
import { playClickSound } from '../../utils/soundEffects';

const levelColorMap = {
  I: '#FF4757',
  II: '#FF6B35',
  III: '#F5A623',
  IV: '#00D0E9',
} as const;

const warningColorMap = {
  '红色': '#FF4757',
  '橙色': '#FF6B35',
  '黄色': '#F5A623',
  '蓝色': '#00D0E9',
} as const;

const PHASE_ORDER: EmergencyPhase[] = ['warning', 'shutdown_start', 'peak', 'recovery_prepare', 'recovery'];

const PHASE_VEHICLES: Record<EmergencyPhase, number> = {
  warning: 500,
  shutdown_start: 1200,
  peak: 3100,
  recovery_prepare: 2400,
  recovery: 800,
};

const PHASE_BANNER_COLOR: Record<EmergencyPhase, string> = {
  warning: '#F5A623',
  shutdown_start: '#FF4757',
  peak: '#FF4757',
  recovery_prepare: '#00D0E9',
  recovery: '#2ED573',
};

export default function EmergencyBanner() {
  const emergency = useDashboardStore((s) => s.emergencyState);
  const setEmergencyState = useDashboardStore((s) => s.setEmergencyState);
  const setActiveModal = useDashboardStore((s) => s.setActiveModal);
  const levelColor = levelColorMap[emergency.emergencyLevel];
  const phaseColor = PHASE_BANNER_COLOR[emergency.forecast.strandedPhase];
  const color = phaseColor ?? levelColor;
  const typhoon = emergency.typhoon;
  const warnColor = warningColorMap[typhoon.warningLevel];

  const currentPhase = emergency.forecast.strandedPhase;
  const currentPhaseIdx = PHASE_ORDER.indexOf(currentPhase);
  const canAdvance = currentPhaseIdx < PHASE_ORDER.length - 1;

  const handleAdvancePhase = () => {
    if (!canAdvance) return;
    playClickSound();
    const nextPhase = PHASE_ORDER[currentPhaseIdx + 1];
    const nextVehicles = PHASE_VEHICLES[nextPhase];
    const nextLabel = PHASE_LABELS[nextPhase];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setEmergencyState({
      phaseLabel: nextLabel,
      forecast: {
        ...emergency.forecast,
        strandedPhase: nextPhase,
        currentStrandedVehicles: nextVehicles,
      },
      communications: [
        {
          id: `phase-${Date.now()}`,
          type: 'system',
          source: '系统',
          time: timeStr,
          content: `应急阶段推进：${PHASE_LABELS[currentPhase]} → ${nextLabel}，当前滞留 ${nextVehicles} 辆`,
          urgent: nextPhase === 'peak',
        },
        ...emergency.communications,
      ],
    });
  };

  return (
    <div style={{ margin: '0 20px' }}>
      {/* 主横幅 */}
      <div
        style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          borderRadius: '8px 8px 0 0',
          border: `1px solid ${color}66`,
          borderBottom: 'none',
          background: `linear-gradient(90deg, ${color}22 0%, rgba(10,15,25,0.96) 35%, rgba(10,15,25,0.96) 100%)`,
          boxShadow: `0 0 24px ${color}22`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={18} color={color} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color }}>{emergency.bannerTitle}</div>
            <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 1 }}>{emergency.bannerSubtitle}</div>
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
          {currentPhase === 'recovery' && emergency.forecast.currentStrandedVehicles < 500 && (
            <button
              onClick={() => {
                playClickSound();
                setActiveModal('emergency-report');
              }}
              style={{
                padding: '6px 14px', fontSize: 11, fontWeight: 600, borderRadius: 6, cursor: 'pointer',
                background: 'rgba(46,213,115,0.15)', border: '1px solid #2ED573', color: '#2ED573',
              }}
            >
              查看报告 / 返回总览
            </button>
          )}
        </div>
      </div>

      {/* 台风气象信息条 */}
      <div style={{
        height: 36,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        padding: '0 20px',
        borderRadius: '0 0 8px 8px',
        border: `1px solid ${color}66`,
        borderTop: `1px solid ${color}22`,
        background: 'rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>台风"{typhoon.name}"</span>
          <span style={{
            fontSize: 10, padding: '1px 6px', borderRadius: 3,
            background: `${warnColor}22`, color: warnColor, fontWeight: 600,
          }}>{typhoon.warningLevel}预警</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Navigation size={12} color="#94A3B8" />
          <span style={{ fontSize: 11, color: '#94A3B8' }}>距离</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', fontFamily: 'monospace' }}>{typhoon.distance}km</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Wind size={12} color="#94A3B8" />
          <span style={{ fontSize: 11, color: '#94A3B8' }}>风力</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: typhoon.windLevel >= 10 ? '#FF6B35' : '#E2E8F0', fontFamily: 'monospace' }}>{typhoon.windLevel}级 ({typhoon.windSpeed}m/s)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <CloudRain size={12} color="#94A3B8" />
          <span style={{ fontSize: 11, color: '#94A3B8' }}>降雨</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: typhoon.rainfall > 30 ? '#F5A623' : '#E2E8F0', fontFamily: 'monospace' }}>{typhoon.rainfall}mm/h</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Eye size={12} color="#94A3B8" />
          <span style={{ fontSize: 11, color: '#94A3B8' }}>能见度</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: typhoon.visibility < 5 ? '#F5A623' : '#E2E8F0', fontFamily: 'monospace' }}>{typhoon.visibility}km</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>向{typhoon.direction}移动 {typhoon.speed}km/h</span>
          <span style={{ fontSize: 11, color: '#64748B' }}>·</span>
          <span style={{ fontSize: 11, color: '#FF6B35', fontWeight: 600 }}>预计{typhoon.landingTime}登陆</span>
        </div>

        {/* 模拟推进按钮 */}
        <button
          onClick={handleAdvancePhase}
          disabled={!canAdvance}
          style={{
            marginLeft: 16,
            padding: '3px 10px',
            fontSize: 10,
            color: canAdvance ? '#00D0E9' : '#64748B',
            background: 'transparent',
            border: `1px solid ${canAdvance ? '#00D0E944' : '#64748B44'}`,
            borderRadius: 4,
            cursor: canAdvance ? 'pointer' : 'not-allowed',
            opacity: canAdvance ? 1 : 0.5,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (canAdvance) {
              e.currentTarget.style.background = '#00D0E911';
              e.currentTarget.style.borderColor = '#00D0E9';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = canAdvance ? '#00D0E944' : '#64748B44';
          }}
        >
          模拟推进
        </button>
      </div>
    </div>
  );
}
