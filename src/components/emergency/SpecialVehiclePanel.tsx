import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useEmergencyStore } from '../../stores/emergencyStore';
import { useUIStore } from '../../stores/uiStore';
import CollapsibleCard from '../common/CollapsibleCard';

const coldChainAlerts = [
  { level: '黄色', threshold: '> 6h', count: 42, color: '#F5A623' },
  { level: '橙色', threshold: '> 12h', count: 18, color: '#FF6B35' },
  { level: '红色', threshold: '> 24h', count: 3, color: '#FF4757' },
];

export default function SpecialVehiclePanel() {
  const forecast = useEmergencyStore((s) => s.emergencyState.forecast);
  const shutdownStartTime = useEmergencyStore((s) => s.emergencyState.shutdownStartTime);
  const setActiveModal = useUIStore((s) => s.setActiveModal);
  const [elapsed, setElapsed] = useState('');
  const [elapsedColor, setElapsedColor] = useState('#2ED573');

  useEffect(() => {
    const updateElapsed = () => {
      const now = new Date();
      const [startHour, startMin] = shutdownStartTime.split(':').map(Number);
      const start = new Date();
      start.setHours(startHour, startMin, 0, 0);

      let diffMs = now.getTime() - start.getTime();
      if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      setElapsed(`${hours}h ${minutes}m`);

      if (hours >= 24) setElapsedColor('#FF4757');
      else if (hours >= 12) setElapsedColor('#FF6B35');
      else if (hours >= 6) setElapsedColor('#F5A623');
      else setElapsedColor('#2ED573');
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 60000);
    return () => clearInterval(interval);
  }, [shutdownStartTime]);

  const redAlertCount = coldChainAlerts.find((a) => a.level === '红色')?.count ?? 0;

  const summary = (
    <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
      冷链 <span style={{ color: '#00D0E9', fontWeight: 600 }}>{forecast.coldChainVehicles}</span> · 危化 <span style={{ color: '#FF6B35', fontWeight: 600 }}>{forecast.hazardousVehicles}</span> · 红色预警 <span style={{ color: '#FF4757', fontWeight: 600 }}>{redAlertCount}</span>
    </div>
  );

  return (
    <CollapsibleCard
      title="特殊车辆追踪"
      icon={<AlertTriangle size={12} style={{ color: '#4da6ff' }} />}
      summary={summary}
      defaultExpanded={true}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={(e) => { e.stopPropagation(); setActiveModal('special-vehicle-detail'); }}
            style={{
              fontSize: 10, padding: '3px 8px', background: 'transparent',
              border: '1px solid rgba(0,208,233,0.4)', color: '#00D0E9',
              borderRadius: 4, cursor: 'pointer', lineHeight: 1.4,
            }}
          >
            查看明细
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>冷链车</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#00D0E9', fontFamily: 'DIN, sans-serif' }}>{forecast.coldChainVehicles} 辆</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>危化品车</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#FF6B35', fontFamily: 'DIN, sans-serif' }}>{forecast.hazardousVehicles} 辆</span>
        </div>
        {/* Countdown timer */}
        <div style={{ padding: '6px 10px', borderRadius: 6, background: `${elapsedColor}11`, border: `1px solid ${elapsedColor}33` }}>
          <div style={{ fontSize: 10, color: '#94A3B8' }}>已滞留时长</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: elapsedColor, marginTop: 2, fontFamily: 'DIN, sans-serif' }}>{elapsed}</div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
          <div style={{ fontSize: 11, color: '#64748B', marginBottom: 6 }}>冷链超时预警</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {coldChainAlerts.map((alert) => (
              <div key={alert.level} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: alert.color, flexShrink: 0 }} />
                <span style={{ color: alert.color, fontWeight: 600, width: 28 }}>{alert.level}</span>
                <span style={{ color: '#64748B', flex: 1 }}>{alert.threshold}</span>
                <span style={{ color: '#E2E8F0', fontWeight: 700, fontFamily: 'DIN, sans-serif' }}>{alert.count} 辆</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CollapsibleCard>
  );
}
