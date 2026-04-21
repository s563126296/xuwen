import { CloudRain } from 'lucide-react';
import { useOverviewStore } from '../../stores/overviewStore';
import type { WeatherCouplingLevel } from '../../stores/overviewStore';
import CollapsibleCard from '../common/CollapsibleCard';

const levelConfig: Record<WeatherCouplingLevel, { label: string; color: string; bg: string; border: string }> = {
  none: { label: '无影响', color: '#2ED573', bg: 'rgba(46,213,115,0.15)', border: 'rgba(46,213,115,0.3)' },
  slight: { label: '轻微', color: '#F5A623', bg: 'rgba(245,166,35,0.15)', border: 'rgba(245,166,35,0.3)' },
  significant: { label: '显著', color: '#FF8C00', bg: 'rgba(255,140,0,0.15)', border: 'rgba(255,140,0,0.3)' },
  severe: { label: '严重', color: '#FF4757', bg: 'rgba(255,71,87,0.15)', border: 'rgba(255,71,87,0.3)' },
};

export default function WeatherCouplingCard({ delay = '0s' }: { delay?: string }) {
  const weatherCoupling = useOverviewStore((s) => s.weatherCoupling);
  const cfg = levelConfig[weatherCoupling.level];

  const summary = (
    <div style={{ fontSize: 11, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)', display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      <span>海况 <span style={{ color: '#4da6ff' }}>{weatherCoupling.seaScore}</span></span>
      <span style={{ color: '#A0A8B4' }}>·</span>
      <span>陆况 <span style={{ color: '#4da6ff' }}>{weatherCoupling.landScore}</span></span>
      <span style={{ color: '#A0A8B4' }}>·</span>
      <span>综合 <span style={{ color: cfg.color }}>{weatherCoupling.overallScore}</span></span>
      <span style={{ color: '#A0A8B4' }}>·</span>
      <span style={{ color: cfg.color }}>{cfg.label}</span>
    </div>
  );

  return (
    <CollapsibleCard
      defaultExpanded={true}
      title="天气影响程度"
      icon={<CloudRain size={12} color="#4da6ff" />}
      summary={summary}
      delay={delay}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{
          display: 'inline-block', padding: '3px 8px', borderRadius: 12,
          fontSize: 11, fontWeight: 500, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
        }}>
          {cfg.label}
        </span>
        <span style={{ fontFamily: 'DIN, sans-serif', fontSize: 12, fontWeight: 700, color: cfg.color }}>
          {weatherCoupling.overallScore}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 6 }}>
        <div style={{ fontSize: 11, color: '#C9CDD4' }}>
          <span style={{ color: '#A0A8B4' }}>海峡：</span>
          {weatherCoupling.seaFactors.join('、')}
        </div>
        <div style={{ fontSize: 11, color: '#C9CDD4' }}>
          <span style={{ color: '#A0A8B4' }}>陆地：</span>
          {weatherCoupling.landFactors.join('、')}
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#A0A8B4', padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: 4 }}>
        {weatherCoupling.trend}
      </div>
    </CollapsibleCard>
  );
}
