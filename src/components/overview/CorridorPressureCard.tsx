import { Activity, Compass } from 'lucide-react';
import { useOverviewStore } from '../../stores/overviewStore';
import type { CorridorDirection } from '../../stores/overviewStore';
import CollapsibleCard from '../common/CollapsibleCard';

function pressureColor(p: number): string {
  if (p < 50) return '#2ED573';
  if (p < 70) return '#F5A623';
  if (p < 85) return '#FF8C00';
  return '#FF4757';
}

const dirLabels: Record<CorridorDirection, { label: string; road: string }> = {
  north: { label: '北', road: 'G207' },
  south: { label: '南', road: '港口' },
  west: { label: '西', road: 'S376' },
  east: { label: '东', road: '环半岛' },
};

function PressureItem({ direction }: { direction: CorridorDirection }) {
  const corridorPressure = useOverviewStore((s) => s.corridorPressure);
  const item = corridorPressure[direction];
  const color = pressureColor(item.pressure);
  const info = dirLabels[direction];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <div style={{ fontSize: 11, color: '#A0A8B4' }}>{info.label} ({info.road})</div>
      <div style={{ width: '100%', height: 6, background: 'rgba(0,0,0,0.3)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${item.pressure}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
      </div>
      <div style={{ fontFamily: 'DIN, sans-serif', fontSize: 12, fontWeight: 700, color }}>{item.pressure}%</div>
    </div>
  );
}

export default function CorridorPressureCard() {
  const corridorPressure = useOverviewStore((s) => s.corridorPressure);
  const s = corridorPressure.south.pressure;
  const w = corridorPressure.west.pressure;
  const n = corridorPressure.north.pressure;
  const e = corridorPressure.east.pressure;

  const summary = (
    <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
      南向 <span style={{ color: pressureColor(s), fontWeight: 600 }}>{s}%</span> · 西向 <span style={{ color: pressureColor(w), fontWeight: 600 }}>{w}%</span> · 北向 <span style={{ color: pressureColor(n), fontWeight: 600 }}>{n}%</span> · 东向 <span style={{ color: pressureColor(e), fontWeight: 600 }}>{e}%</span>
    </div>
  );

  return (
    <CollapsibleCard
      defaultExpanded={true}
      title="进出城通道"
      icon={<Activity size={12} style={{ color: '#4da6ff' }} />}
      summary={summary}
      delay="0.2s"
    >
      {/* Cross layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: 'auto auto auto', gap: 6, padding: '4px 0' }}>
        <div style={{ gridColumn: '2 / 3', gridRow: '1 / 2' }}>
          <PressureItem direction="north" />
        </div>
        <div style={{ gridColumn: '1 / 2', gridRow: '2 / 3' }}>
          <PressureItem direction="west" />
        </div>
        <div style={{ gridColumn: '2 / 3', gridRow: '2 / 3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,208,233,0.1)', border: '1px solid rgba(0,208,233,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Compass size={16} style={{ color: '#00D0E9' }} />
          </div>
        </div>
        <div style={{ gridColumn: '3 / 4', gridRow: '2 / 3' }}>
          <PressureItem direction="east" />
        </div>
        <div style={{ gridColumn: '2 / 3', gridRow: '3 / 4' }}>
          <PressureItem direction="south" />
        </div>
      </div>
    </CollapsibleCard>
  );
}
