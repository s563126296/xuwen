import { ParkingCircle } from 'lucide-react';
import CountUp from 'react-countup';
import { usePortStore } from '../../../stores/portStore';

const getCapacityColor = (ratio: number): string => {
  if (ratio < 0.5) return '#2ED573';
  if (ratio < 0.75) return '#F5A623';
  return '#FF4757';
};

export default function WaitingAreaPanel() {
  const { waitingAreas } = usePortStore();

  const totalWaiting = waitingAreas.reduce((sum, area) => sum + area.current, 0);
  const totalCar = waitingAreas.reduce((sum, area) => sum + area.byType.car, 0);
  const totalTruck = waitingAreas.reduce((sum, area) => sum + area.byType.truck, 0);
  const totalHazmat = waitingAreas.reduce((sum, area) => sum + area.byType.hazmat, 0);

  return (
    <div className="module-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '8px 10px' }}>
      {/* 标题行 + 核心数字 同行 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexShrink: 0 }}>
        <ParkingCircle size={12} style={{ color: '#4da6ff' }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>待渡区</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontFamily: 'DIN, sans-serif', fontSize: 20, fontWeight: 700, color: '#00D0E9' }}>
            <CountUp end={totalWaiting} duration={1.5} separator="," />
          </span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>辆</span>
        </div>
      </div>

      {/* 进度条区域 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minHeight: 0, justifyContent: 'center' }}>
        {waitingAreas.map((area) => {
          const ratio = area.current / area.capacity;
          const color = getCapacityColor(ratio);
          const pct = Math.round(ratio * 100);
          return (
            <div key={area.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', minWidth: 80, flexShrink: 0 }}>{area.name}</span>
              <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  width: `${pct}%`, height: '100%',
                  background: `linear-gradient(90deg, ${color}aa, ${color})`,
                  borderRadius: 4, transition: 'width 0.5s ease',
                }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color, fontFamily: 'DIN, sans-serif', minWidth: 55, textAlign: 'right' }}>
                {area.current}/{area.capacity}
              </span>
            </div>
          );
        })}
      </div>

      {/* 底部分车型 */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4, flexShrink: 0 }}>
        {[
          { label: '客车', value: totalCar, color: '#00D0E9' },
          { label: '货车', value: totalTruck, color: '#F5A623' },
          { label: '危化', value: totalHazmat, color: '#FF4757' },
        ].map((t) => (
          <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: t.color }} />
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)' }}>{t.label}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: t.color, fontFamily: 'DIN, sans-serif' }}>{t.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
