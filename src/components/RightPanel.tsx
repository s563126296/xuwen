import { AlertTriangle } from 'lucide-react';
import { useOverviewStore } from '../stores';
import PressureTransmissionCard from './overview/PressureTransmissionCard';
import CorridorElasticityCard from './overview/CorridorElasticityCard';
import SystemResilienceCard from './overview/SystemResilienceCard';
import ShutdownProbabilityCard from './overview/ShutdownProbabilityCard';
import WeatherCouplingCard from './overview/WeatherCouplingCard';
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

  return (
    <div className="panel-right" style={{ gap: 12 }}>
      <div style={{ animationDelay: '0.05s' }}><PressureTransmissionCard /></div>
      <div style={{ animationDelay: '0.10s' }}><CorridorElasticityCard /></div>
      <div style={{ animationDelay: '0.15s' }}><SystemResilienceCard /></div>
      <div style={{ animationDelay: '0.20s' }}><ShutdownProbabilityCard /></div>
      <div style={{ animationDelay: '0.25s' }}><WeatherCouplingCard /></div>

      {/* Simplified congestion alerts */}
      <div className="module-card animate-in" style={{ animationDelay: '0.30s' }}>
        <div className="module-header">
          <span className="module-title"><AlertTriangle size={14} style={{ marginRight: 4 }} />拥堵预警</span>
          <span style={{ fontSize: 11, color: '#A0A8B4' }}>TOP 3</span>
        </div>
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
      </div>
    </div>
  );
}
