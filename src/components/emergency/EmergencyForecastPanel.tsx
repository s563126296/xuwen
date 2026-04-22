import { TrendingUp } from 'lucide-react';
import { useEmergencyStore } from '../../stores/emergencyStore';
import CollapsibleCard from '../common/CollapsibleCard';

export default function EmergencyForecastPanel() {
  const forecast = useEmergencyStore((s) => s.emergencyState.forecast);

  const summary = (
    <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
      滞留 <span style={{ color: '#FF6B35', fontWeight: 600 }}>{forecast.currentStrandedVehicles}</span> 辆 · 峰值 <span style={{ color: '#FF4757', fontWeight: 600 }}>{forecast.peakStrandedVehicles}</span> 辆
    </div>
  );

  return (
    <CollapsibleCard
      title="态势预测"
      icon={<TrendingUp size={12} style={{ color: '#4da6ff' }} />}
      summary={summary}
      defaultExpanded={true}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: '#64748B' }}>当前滞留</div>
          <div style={{ fontSize: 24, color: '#FF6B35', fontWeight: 700, fontFamily: 'DIN, sans-serif' }}>{forecast.currentStrandedVehicles}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#64748B' }}>预计峰值</div>
          <div style={{ fontSize: 24, color: '#FF4757', fontWeight: 700, fontFamily: 'DIN, sans-serif' }}>{forecast.peakStrandedVehicles}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#64748B' }}>增速</div>
          <div style={{ fontSize: 18, color: '#F5A623', fontWeight: 600, fontFamily: 'DIN, sans-serif' }}>+{forecast.strandedGrowthPerHour}/h</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#64748B' }}>预计复航</div>
          <div style={{ fontSize: 18, color: '#00D0E9', fontWeight: 600, fontFamily: 'DIN, sans-serif' }}>{forecast.estimatedResumeTime}</div>
        </div>
      </div>
      <div style={{ marginTop: 14, padding: 10, borderRadius: 6, background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.15)' }}>
        <div style={{ fontSize: 11, color: '#94A3B8' }}>停航时长 / 消化时间</div>
        <div style={{ marginTop: 4, fontSize: 13, color: '#E2E8F0' }}>
          预计停航 {forecast.estimatedShutdownHours} 小时 · 复航后消化约 {forecast.estimatedRecoveryHours} 小时
        </div>
      </div>
    </CollapsibleCard>
  );
}
