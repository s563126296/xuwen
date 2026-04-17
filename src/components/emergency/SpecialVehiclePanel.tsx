import { useState, useEffect } from 'react';
import { useDashboardStore } from '../../store/dashboardStore';

const coldChainAlerts = [
  { level: '黄色', threshold: '> 6h', count: 42, color: '#F5A623' },
  { level: '橙色', threshold: '> 12h', count: 18, color: '#FF6B35' },
  { level: '红色', threshold: '> 24h', count: 3, color: '#FF4757' },
];

export default function SpecialVehiclePanel() {
  const forecast = useDashboardStore((s) => s.emergencyState.forecast);
  const shutdownStartTime = useDashboardStore((s) => s.emergencyState.shutdownStartTime);
  const [elapsed, setElapsed] = useState('');
  const [elapsedColor, setElapsedColor] = useState('#2ED573');

  useEffect(() => {
    const updateElapsed = () => {
      const now = new Date();
      const [startHour, startMin] = shutdownStartTime.split(':').map(Number);
      const start = new Date();
      start.setHours(startHour, startMin, 0, 0);

      let diffMs = now.getTime() - start.getTime();
      if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; // Handle day wrap

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      setElapsed(`${hours}h ${minutes}m`);

      // Color based on duration
      if (hours >= 24) setElapsedColor('#FF4757');
      else if (hours >= 12) setElapsedColor('#FF6B35');
      else if (hours >= 6) setElapsedColor('#F5A623');
      else setElapsedColor('#2ED573');
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [shutdownStartTime]);

  return (
    <div className="card" style={{ padding: 14, flex: '30 0 0', minHeight: 0, overflow: 'hidden' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 12 }}>B. 特殊车辆追踪</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>冷链车</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#00D0E9' }}>{forecast.coldChainVehicles} 辆</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>危化品车</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#FF6B35' }}>{forecast.hazardousVehicles} 辆</span>
        </div>
        {/* Countdown timer */}
        <div style={{ padding: '6px 10px', borderRadius: 6, background: `${elapsedColor}11`, border: `1px solid ${elapsedColor}33` }}>
          <div style={{ fontSize: 10, color: '#94A3B8' }}>已滞留时长</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: elapsedColor, marginTop: 2 }}>{elapsed}</div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
          <div style={{ fontSize: 11, color: '#64748B', marginBottom: 6 }}>冷链超时预警</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {coldChainAlerts.map((alert) => (
              <div key={alert.level} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: alert.color, flexShrink: 0 }} />
                <span style={{ color: alert.color, fontWeight: 600, width: 28 }}>{alert.level}</span>
                <span style={{ color: '#64748B', flex: 1 }}>{alert.threshold}</span>
                <span style={{ color: '#E2E8F0', fontWeight: 700 }}>{alert.count} 辆</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
