import { useDashboardStore } from '../../store/dashboardStore';

export default function EmergencyForecastPanel() {
  const forecast = useDashboardStore((s) => s.emergencyState.forecast);

  return (
    <div className="card" style={{ padding: 14, flex: '35 0 0', minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 12, flexShrink: 0 }}>A. 态势预测</div>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: '#64748B' }}>当前滞留</div>
          <div style={{ fontSize: 24, color: '#FF6B35', fontWeight: 700 }}>{forecast.currentStrandedVehicles}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#64748B' }}>预计峰值</div>
          <div style={{ fontSize: 24, color: '#FF4757', fontWeight: 700 }}>{forecast.peakStrandedVehicles}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#64748B' }}>增速</div>
          <div style={{ fontSize: 18, color: '#F5A623', fontWeight: 600 }}>+{forecast.strandedGrowthPerHour}/h</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#64748B' }}>预计复航</div>
          <div style={{ fontSize: 18, color: '#00D0E9', fontWeight: 600 }}>{forecast.estimatedResumeTime}</div>
        </div>
      </div>
      <div style={{ marginTop: 14, padding: 10, borderRadius: 6, background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.15)' }}>
        <div style={{ fontSize: 11, color: '#94A3B8' }}>停航时长 / 消化时间</div>
        <div style={{ marginTop: 4, fontSize: 13, color: '#E2E8F0' }}>
          预计停航 {forecast.estimatedShutdownHours} 小时 · 复航后消化约 {forecast.estimatedRecoveryHours} 小时
        </div>
      </div>
      </div>
    </div>
  );
}
