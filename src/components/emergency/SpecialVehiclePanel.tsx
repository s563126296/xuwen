import { useDashboardStore } from '../../store/dashboardStore';

export default function SpecialVehiclePanel() {
  const forecast = useDashboardStore((s) => s.emergencyState.forecast);

  return (
    <div className="card" style={{ padding: 14, minHeight: 170 }}>
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
        <div style={{ padding: 10, borderRadius: 6, background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.15)' }}>
          <div style={{ fontSize: 11, color: '#F5A623', fontWeight: 600 }}>重点关注</div>
          <div style={{ marginTop: 4, fontSize: 12, color: '#CBD5E1' }}>冷链车需要优先安排有电源停车位，复航后优先放行。</div>
        </div>
      </div>
    </div>
  );
}
