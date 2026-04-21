import { AlertTriangle } from 'lucide-react';
import { useOverviewStore } from '../stores';
import PressureTransmissionCard from './overview/PressureTransmissionCard';
import CorridorElasticityCard from './overview/CorridorElasticityCard';
import SystemResilienceCard from './overview/SystemResilienceCard';
import ShutdownProbabilityCard from './overview/ShutdownProbabilityCard';
import WeatherCouplingCard from './overview/WeatherCouplingCard';
import CollapsibleCard from './common/CollapsibleCard';
import { TRAFFIC_STATUS_COLORS } from '../constants';

const getLevelColor = (level: string) => {
  switch (level) {
    case '畅通': return TRAFFIC_STATUS_COLORS.SMOOTH;
    case '一般': return TRAFFIC_STATUS_COLORS.NORMAL;
    case '轻度拥堵': return TRAFFIC_STATUS_COLORS.LIGHT_CONGESTION;
    case '中度拥堵': return TRAFFIC_STATUS_COLORS.MODERATE_CONGESTION;
    case '重度拥堵': return TRAFFIC_STATUS_COLORS.HEAVY_CONGESTION;
    default: return '#A0A8B4';
  }
};

export default function RightPanel() {
  const roadCongestions = useOverviewStore((s) => s.roadCongestions);
  const top3 = [...roadCongestions].sort((a, b) => b.index - a.index).slice(0, 3);

  const congestionSummary = (
    <div style={{ fontSize: 12, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)', display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      {top3.map((item, i) => {
        const color = getLevelColor(item.level);
        return (
          <span key={i}>
            {item.road.length > 8 ? item.road.slice(0, 8) + '...' : item.road}
            <span style={{ color, marginLeft: 4 }}>{item.level}</span>
            {i < top3.length - 1 && <span style={{ color: '#A0A8B4' }}> · </span>}
          </span>
        );
      })}
    </div>
  );

  return (
    <div className="panel-right" style={{ gap: 12 }}>
      <PressureTransmissionCard delay="0.05s" />
      <CorridorElasticityCard delay="0.10s" />
      <SystemResilienceCard delay="0.15s" />
      <ShutdownProbabilityCard delay="0.20s" />
      <WeatherCouplingCard delay="0.25s" />

      <CollapsibleCard
        title="拥堵预警"
        icon={<AlertTriangle size={14} color="#f87171" />}
        summary={congestionSummary}
        delay="0.30s"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {top3.map((item, i) => {
            const color = getLevelColor(item.level);
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: 6,
                borderLeft: `3px solid ${color}`,
              }}>
                <span style={{ fontSize: 12, color: '#C9CDD4', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.road}</span>
                <span style={{
                  fontSize: 11, padding: '1px 6px', borderRadius: 8, marginLeft: 8,
                  background: `${color}20`, color,
                }}>{item.level}</span>
              </div>
            );
          })}
        </div>
      </CollapsibleCard>
    </div>
  );
}
