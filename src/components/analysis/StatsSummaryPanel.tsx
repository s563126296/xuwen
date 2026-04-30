import { TrendingUp, Activity, Clock, Target, AlertTriangle, Users } from 'lucide-react';
import { useAnalysisStore } from '../../stores';
import { filterEvents } from '../../utils/analysisMockData';

export default function StatsSummaryPanel() {
  const analysisState = useAnalysisStore((s) => s.analysisState);
  const { filters, strategyRecords } = analysisState;
  const filteredEvents = filterEvents(analysisState.events, filters) as typeof analysisState.events;
  const relatedRecords = strategyRecords.filter(r => filteredEvents.some(e => e.id === r.eventId));
  const adoptedRecords = relatedRecords.filter(r => r.adopted);
  const avgReliefMinutes = adoptedRecords.length > 0 ? Math.round(adoptedRecords.reduce((sum, r) => sum + r.reliefMinutes, 0) / adoptedRecords.length) : 0;
  const adoptionRate = relatedRecords.length > 0 ? Math.round((adoptedRecords.length / relatedRecords.length) * 100) : 0;
  const maxCongestion = filteredEvents.length > 0 ? Math.max(...filteredEvents.map(e => e.peakCongestionIndex)) : 0;
  const totalStranded = filteredEvents.reduce((sum, e) => sum + e.maxStrandedVehicles, 0);

  const stats = [
    { icon: Activity, label: '事件总数', value: filteredEvents.length, unit: '条', color: '#4DA6FF' },
    { icon: Target, label: '策略执行', value: relatedRecords.length, unit: '次', color: '#00D0E9' },
    { icon: Clock, label: '平均缓解', value: avgReliefMinutes, unit: '分钟', color: '#2ED573' },
    { icon: TrendingUp, label: '策略采纳率', value: adoptionRate, unit: '%', color: '#F5A623' },
    { icon: AlertTriangle, label: '最高拥堵', value: maxCongestion.toFixed(1), unit: '', color: '#FF4757' },
    { icon: Users, label: '累计滞留', value: totalStranded, unit: '辆', color: '#A78BFA' },
  ];

  return (
    <div style={{
      flexShrink: 0,
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      borderRadius: 8,
      backdropFilter: 'blur(var(--glass-blur))',
      padding: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <TrendingUp size={14} color="#4DA6FF" />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>统计摘要</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {stats.map((stat, idx) => (
          <div key={idx} style={{
            padding: 10,
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 6,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <stat.icon size={12} color={stat.color} />
              <span style={{ fontSize: 10, color: '#A0A8B4' }}>{stat.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: stat.color }}>{stat.value}</span>
              {stat.unit && <span style={{ fontSize: 10, color: '#64748B' }}>{stat.unit}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
