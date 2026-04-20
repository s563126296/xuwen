import { Zap, Calendar, CloudRain, AlertTriangle, BarChart3, GitCompare } from 'lucide-react';
import { useAnalysisStore } from '../../stores';

const QUICK_FILTERS = [
  { id: 'today', label: '今日概览', icon: Calendar, color: '#00D0E9' },
  { id: 'week', label: '本周汇总', icon: BarChart3, color: '#8B5CF6' },
  { id: 'spring', label: '春运专题', icon: Zap, color: '#F5A623' },
  { id: 'typhoon', label: '台风事件', icon: CloudRain, color: '#FF4757' },
  { id: 'congestion', label: '重大拥堵', icon: AlertTriangle, color: '#F5A623' },
  { id: 'holiday', label: '节假日对比', icon: GitCompare, color: '#2ED573' },
];

export default function QuickFilterPanel() {
  const activeQuickFilter = useAnalysisStore((s) => s.analysisState.activeQuickFilter);
  const setAnalysisQuickFilter = useAnalysisStore((s) => s.setAnalysisQuickFilter);

  return (
    <div style={{
      flex: 1,
      minHeight: 0,
      background: 'rgba(13,27,42,0.8)',
      border: '1px solid rgba(139,92,246,0.2)',
      borderRadius: 8,
      backdropFilter: 'blur(10px)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{ flexShrink: 0, padding: 16, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={14} color="#8B5CF6" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>快速筛选</span>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px 16px 12px 8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {QUICK_FILTERS.map(filter => {
            const isActive = activeQuickFilter === filter.id;
            const Icon = filter.icon;
            return (
              <button key={filter.id} onClick={() => setAnalysisQuickFilter(isActive ? null : filter.id)} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                background: isActive ? `${filter.color}15` : 'rgba(0,0,0,0.2)',
                border: `1px solid ${isActive ? filter.color : 'rgba(255,255,255,0.05)'}`,
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
              }}>
                <Icon size={16} color={isActive ? filter.color : '#64748B'} />
                <span style={{ fontSize: 12, color: isActive ? filter.color : '#A0A8B4', fontWeight: isActive ? 600 : 400 }}>
                  {filter.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
