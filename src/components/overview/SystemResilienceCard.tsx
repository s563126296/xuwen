import { Shield, Info } from 'lucide-react';
import { useOverviewStore } from '../../stores/overviewStore';
import { useUIStore } from '../../stores/uiStore';

const getArcColor = (score: number) => {
  if (score > 80) return '#2ED573';
  if (score > 60) return '#F5A623';
  if (score > 40) return '#FF6B35';
  return '#FF4757';
};

const subLabels: { key: 'corridorRedundancy' | 'alternateRoutes' | 'controlCapacity' | 'portBuffer'; label: string }[] = [
  { key: 'corridorRedundancy', label: '通道冗余' },
  { key: 'alternateRoutes', label: '备选路线' },
  { key: 'controlCapacity', label: '调控空间' },
  { key: 'portBuffer', label: '港口缓冲' },
];

export default function SystemResilienceCard() {
  const systemResilience = useOverviewStore((s) => s.systemResilience);
  const setActiveModal = useUIStore((s) => s.setActiveModal);
  const { score, subScores, weakestDimension } = systemResilience;
  const arcColor = getArcColor(score);
  const r = 38;
  const circ = 2 * Math.PI * r;
  const arcLen = circ * 0.75;
  const offset = arcLen * (1 - score / 100);

  return (
    <div className="module-card animate-in">
      <div className="module-header">
        <div
          role="button"
          tabIndex={0}
          aria-label="查看韧性指标说明"
          onClick={() => setActiveModal('resilience-info')}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#00D0E9';
            const infoIcon = e.currentTarget.querySelector('.resilience-info-icon') as HTMLElement;
            if (infoIcon) infoIcon.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '';
            const infoIcon = e.currentTarget.querySelector('.resilience-info-icon') as HTMLElement;
            if (infoIcon) infoIcon.style.opacity = '0.5';
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', transition: 'color 0.2s' }}
        >
          <span className="module-title">
            <Shield size={14} style={{ marginRight: 4 }} />应急承受能力
          </span>
          <Info className="resilience-info-icon" size={14} style={{ color: '#A0A8B4', opacity: 0.5, transition: 'opacity 0.2s' }} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Arc gauge */}
        <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
          <svg viewBox="0 0 100 100" width="90" height="90">
            <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7"
              strokeDasharray={`${arcLen} ${circ - arcLen}`} strokeLinecap="round"
              transform="rotate(135 50 50)" />
            <circle cx="50" cy="50" r={r} fill="none" stroke={arcColor} strokeWidth="7"
              strokeDasharray={`${arcLen - offset} ${circ - (arcLen - offset)}`} strokeLinecap="round"
              transform="rotate(135 50 50)" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
            {/* Threshold tick marks: 40, 60, 80 */}
            {[40, 60, 80].map((threshold) => {
              const angle = 135 + (270 * threshold / 100);
              const rad = (angle * Math.PI) / 180;
              const innerR = r - 6;
              const outerR = r + 6;
              return (
                <line key={threshold}
                  x1={50 + innerR * Math.cos(rad)} y1={50 + innerR * Math.sin(rad)}
                  x2={50 + outerR * Math.cos(rad)} y2={50 + outerR * Math.sin(rad)}
                  stroke="rgba(255,255,255,0.2)" strokeWidth="1"
                />
              );
            })}
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -45%)', textAlign: 'center' }}>
            <div style={{ fontFamily: 'DIN, sans-serif', fontWeight: 700, fontSize: 24, color: arcColor }}>{score}</div>
            <div style={{ fontSize: 11, color: '#A0A8B4' }}>/ 100</div>
          </div>
        </div>
        {/* Sub scores */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {subLabels.map(({ key, label }) => {
            const val = subScores[key];
            const c = getArcColor(val);
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#A0A8B4', width: 48, flexShrink: 0 }}>{label}</span>
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${val}%`, height: '100%', background: c, borderRadius: 3 }} />
                </div>
                <span style={{ fontFamily: 'DIN, sans-serif', fontSize: 11, fontWeight: 700, color: c, width: 24, textAlign: 'right' }}>{val}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ marginTop: 6, fontSize: 11, color: '#F5A623', textAlign: 'center' }}>
        薄弱环节：{weakestDimension}
      </div>
    </div>
  );
}
