import { useState } from 'react';
import { BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';
import { playClickSound } from '../../utils/soundEffects';

export default function HistoryStatsPanel() {
  const [expanded, setExpanded] = useState(false);
  const stats = useDashboardStore((s) => s.commandState.historyStats);

  if (!expanded) {
    return (
      <div
        onClick={() => { playClickSound(); setExpanded(true); }}
        style={{
          marginTop: 12, padding: '8px 12px', borderRadius: 6,
          background: 'rgba(13,27,42,0.5)', border: '1px solid rgba(148,163,184,0.15)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <BarChart3 size={14} color="#94A3B8" />
          <span style={{ fontSize: 11, color: '#94A3B8' }}>
            近7日执行 {stats.totalExecuted} 次 · 采纳率 {stats.adoptionRate}%
          </span>
        </div>
        <ChevronDown size={14} color="#64748B" />
      </div>
    );
  }

  return (
    <div style={{
      marginTop: 12, padding: 12, borderRadius: 6,
      background: 'rgba(13,27,42,0.5)', border: '1px solid rgba(148,163,184,0.15)',
    }}>
      {/* Header */}
      <div
        onClick={() => { playClickSound(); setExpanded(false); }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 10, cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <BarChart3 size={14} color="#94A3B8" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>历史策略效果</span>
        </div>
        <ChevronUp size={14} color="#64748B" />
      </div>

      {/* Summary */}
      <div style={{ marginBottom: 10, padding: 8, borderRadius: 4, background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4 }}>近7日统计</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>执行 </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#00D0E9' }}>{stats.totalExecuted}</span>
            <span style={{ fontSize: 10, color: '#64748B' }}> 次</span>
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>采纳率 </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#2ED573' }}>{stats.adoptionRate}%</span>
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>平均缓解 </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#F5A623' }}>{stats.avgReliefMinutes}</span>
            <span style={{ fontSize: 10, color: '#64748B' }}> 分钟</span>
          </div>
        </div>
      </div>

      {/* Top 3 */}
      <div>
        <div style={{ fontSize: 10, color: '#64748B', marginBottom: 6 }}>最有效策略 TOP3</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {stats.top3.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, color: '#00D0E9',
                width: 14, textAlign: 'center',
              }}>
                {idx + 1}
              </span>
              <span style={{ flex: 1, fontSize: 10, color: '#E2E8F0' }}>{item.name}</span>
              <span style={{ fontSize: 10, color: '#2ED573', fontWeight: 600 }}>
                {item.avgMinutes} 分钟
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
