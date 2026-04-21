import { Gauge } from 'lucide-react';
import { useOverviewStore } from '../../stores/overviewStore';
import CollapsibleCard from '../common/CollapsibleCard';

const getBarColor = (pct: number) => {
  if (pct >= 50) return '#2ED573';
  if (pct >= 30) return '#F5A623';
  if (pct >= 15) return '#FF6B35';
  return '#FF4757';
};

export default function CorridorElasticityCard({ delay = '0s' }: { delay?: string }) {
  const corridorElasticity = useOverviewStore((s) => s.corridorElasticity);
  const critical = corridorElasticity.filter(c => c.remainingPercent < 20);

  const summary = (
    <div style={{ fontSize: 12, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)', display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      {corridorElasticity.map((item, i) => {
        const color = getBarColor(item.remainingPercent);
        return (
          <span key={i}>
            {item.name} <span style={{ color }}>{item.remainingPercent}%</span>
            {i < corridorElasticity.length - 1 && <span style={{ color: '#A0A8B4' }}> · </span>}
          </span>
        );
      })}
    </div>
  );

  return (
    <CollapsibleCard
      defaultExpanded={true}
      title="道路剩余容量"
      icon={<Gauge size={14} color="#4da6ff" />}
      summary={summary}
      delay={delay}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {corridorElasticity.map((item, i) => {
          const color = getBarColor(item.remainingPercent);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#C9CDD4', width: 70, flexShrink: 0, textAlign: 'right' }}>{item.name}</span>
              <div style={{ flex: 1, height: 14, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                <div style={{ width: `${item.remainingPercent}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
              </div>
              <span style={{ fontFamily: 'DIN, sans-serif', fontWeight: 700, fontSize: 13, color, width: 36, textAlign: 'right' }}>{item.remainingPercent}%</span>
              <span style={{ fontSize: 11, color: '#A0A8B4', width: 55, textAlign: 'right' }}>+{item.remainingVehicles}辆</span>
            </div>
          );
        })}
      </div>
      {critical.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 11, color: '#FF6B35', padding: '4px 8px', background: 'rgba(255, 107, 53, 0.1)', borderRadius: 4 }}>
          {critical[0].name}接近饱和，+{critical[0].remainingVehicles}辆/h即拥堵
        </div>
      )}
    </CollapsibleCard>
  );
}
