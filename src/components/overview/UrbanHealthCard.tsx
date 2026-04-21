import { Heart } from 'lucide-react';
import { useOverviewStore } from '../../stores/overviewStore';
import CollapsibleCard from '../common/CollapsibleCard';

const getSatColor = (v: number) => {
  if (v < 0.6) return '#2ED573';
  if (v < 0.8) return '#F5A623';
  if (v < 0.9) return '#FF6B35';
  return '#FF4757';
};

const levelColors: Record<string, { color: string; bg: string }> = {
  '健康': { color: '#2ED573', bg: 'rgba(46,213,115,0.15)' },
  '亚健康': { color: '#F5A623', bg: 'rgba(245,166,35,0.15)' },
  '不健康': { color: '#FF6B35', bg: 'rgba(255,107,53,0.15)' },
  '病态': { color: '#FF4757', bg: 'rgba(255,71,87,0.15)' },
};

export default function UrbanHealthCard() {
  const urbanHealth = useOverviewStore((s) => s.urbanHealth);
  const { score, level, intersections, hotspots } = urbanHealth;
  const lc = levelColors[level] || levelColors['健康'];
  const top4 = intersections.slice(0, 4);

  // Find max saturation intersection for summary
  const maxIntersection = intersections.reduce((max, curr) =>
    curr.saturation > max.saturation ? curr : max
  , intersections[0]);

  const summary = (
    <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
      健康度 <span style={{ color: '#4da6ff', fontWeight: 600 }}>{score}</span> · {maxIntersection.name} <span style={{ color: getSatColor(maxIntersection.saturation), fontWeight: 600 }}>{(maxIntersection.saturation * 100).toFixed(0)}%</span> · 热点 <span style={{ color: '#fbbf24', fontWeight: 600 }}>{hotspots.length}处</span>
    </div>
  );

  return (
    <CollapsibleCard
      defaultExpanded={true}
      title="城区道路状况"
      icon={<Heart size={12} style={{ color: '#4da6ff' }} />}
      summary={summary}
      delay="0.3s"
    >
      {/* Score */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
        <span style={{ fontFamily: 'DIN, sans-serif', fontWeight: 700, fontSize: 22, color: '#00D0E9' }}>{score}</span>
        <span style={{ fontSize: 11, color: '#A0A8B4' }}>/ 100</span>
        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: lc.bg, color: lc.color, border: `1px solid ${lc.color}33`, marginLeft: 8 }}>{level}</span>
      </div>
      {/* Intersections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
        {/* Threshold legend */}
        <div style={{ display: 'flex', gap: 6, fontSize: 10, color: '#A0A8B4', marginBottom: 2 }}>
          <span>&lt;0.6 <span style={{ color: '#2ED573' }}>畅通</span></span>
          <span>&lt;0.8 <span style={{ color: '#F5A623' }}>饱和</span></span>
          <span>&lt;0.9 <span style={{ color: '#FF6B35' }}>拥堵</span></span>
          <span>&ge;0.9 <span style={{ color: '#FF4757' }}>严重</span></span>
        </div>
        {top4.map((item, i) => {
          const c = getSatColor(item.saturation);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: '#C9CDD4', width: 100, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
              <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${item.saturation * 100}%`, height: '100%', background: c, borderRadius: 4 }} />
              </div>
              <span style={{ fontFamily: 'DIN, sans-serif', fontWeight: 700, fontSize: 11, color: c, width: 32, textAlign: 'right' }}>{item.saturation.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
      {/* Hotspots */}
      {hotspots.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {hotspots.map((h, i) => (
            <span key={i} style={{
              fontSize: 9, padding: '2px 8px', borderRadius: 8,
              background: h.type === 'sporadic' ? 'rgba(255,71,87,0.15)' : 'rgba(0,208,233,0.1)',
              color: h.type === 'sporadic' ? '#FF4757' : '#A0A8B4',
              border: `1px solid ${h.type === 'sporadic' ? 'rgba(255,71,87,0.3)' : 'rgba(0,208,233,0.15)'}`,
            }}>
              {h.name}
            </span>
          ))}
        </div>
      )}
    </CollapsibleCard>
  );
}
