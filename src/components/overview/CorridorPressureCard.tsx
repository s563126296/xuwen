import { Compass } from 'lucide-react';
import { useOverviewStore } from '../../stores/overviewStore';
import type { CorridorDirection } from '../../stores/overviewStore';

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
      <div style={{ fontSize: 12, color: '#A0A8B4' }}>{info.label} ({info.road})</div>
      <div style={{ width: '100%', height: 6, background: 'rgba(0,0,0,0.3)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${item.pressure}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
      </div>
      <div style={{ fontFamily: 'DIN, sans-serif', fontSize: 14, fontWeight: 700, color }}>{item.pressure}%</div>
    </div>
  );
}

export default function CorridorPressureCard() {
  return (
    <div className="module-card animate-in">
      <div className="module-header">
        <span className="module-title">进出城通道</span>
        <div className="module-icon"><Compass size={16} /></div>
      </div>
      {/* Cross layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: 'auto auto auto', gap: 8, padding: '4px 0' }}>
        {/* Top: North */}
        <div style={{ gridColumn: '2 / 3', gridRow: '1 / 2' }}>
          <PressureItem direction="north" />
        </div>
        {/* Left: West */}
        <div style={{ gridColumn: '1 / 2', gridRow: '2 / 3' }}>
          <PressureItem direction="west" />
        </div>
        {/* Center compass icon */}
        <div style={{ gridColumn: '2 / 3', gridRow: '2 / 3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,208,233,0.1)', border: '1px solid rgba(0,208,233,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Compass size={16} style={{ color: '#00D0E9' }} />
          </div>
        </div>
        {/* Right: East */}
        <div style={{ gridColumn: '3 / 4', gridRow: '2 / 3' }}>
          <PressureItem direction="east" />
        </div>
        {/* Bottom: South */}
        <div style={{ gridColumn: '2 / 3', gridRow: '3 / 4' }}>
          <PressureItem direction="south" />
        </div>
      </div>
    </div>
  );
}
