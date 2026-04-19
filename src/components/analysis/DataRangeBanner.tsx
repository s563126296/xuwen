import { BarChart3, Calendar } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';

export default function DataRangeBanner() {
  const { analysisState } = useDashboardStore();
  const { start, end } = analysisState.filters.dateRange;
  const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
  const eventCount = analysisState.events.length;

  return (
    <div style={{
      position: 'absolute',
      top: 84,
      left: 16,
      right: 16,
      height: 40,
      background: 'linear-gradient(90deg, rgba(139,92,246,0.15) 0%, rgba(0,208,233,0.08) 100%)',
      border: '1px solid rgba(139,92,246,0.25)',
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <BarChart3 size={16} color="#8B5CF6" />
        <span style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0' }}>数据分析模式</span>
      </div>
      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Calendar size={13} color="#A0A8B4" />
        <span style={{ fontSize: 12, color: '#A0A8B4' }}>
          数据范围：{start} ~ {end}（共 {days} 天）
        </span>
      </div>
      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
      <span style={{ fontSize: 12, color: '#A0A8B4' }}>
        历史事件 <span style={{ color: '#8B5CF6', fontWeight: 600 }}>{eventCount}</span> 条
      </span>
    </div>
  );
}
