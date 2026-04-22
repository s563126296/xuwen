import { BarChart3 } from 'lucide-react';
import { useCommandStore } from '../../stores/commandStore';
import CollapsibleCard from '../common/CollapsibleCard';

export default function HistoryStatsPanel() {
  const stats = useCommandStore((s) => s.commandState.historyStats);

  const summary = (
    <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
      近7日执行 <span style={{ fontFamily: 'DIN, sans-serif', color: '#00D0E9' }}>{stats.totalExecuted}</span> 次 · 采纳率 <span style={{ fontFamily: 'DIN, sans-serif', color: '#2ED573' }}>{stats.adoptionRate}%</span>
    </div>
  );

  return (
    <CollapsibleCard
      title="历史策略效果"
      icon={<BarChart3 size={12} style={{ color: '#4da6ff' }} />}
      summary={summary}
      defaultExpanded={false}
    >
      {/* Summary */}
      <div style={{ marginBottom: 10, padding: 8, borderRadius: 4, background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4 }}>近7日统计</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>执行 </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#00D0E9', fontFamily: 'DIN, sans-serif' }}>{stats.totalExecuted}</span>
            <span style={{ fontSize: 10, color: '#64748B' }}> 次</span>
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>采纳率 </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#2ED573', fontFamily: 'DIN, sans-serif' }}>{stats.adoptionRate}%</span>
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>平均缓解 </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#F5A623', fontFamily: 'DIN, sans-serif' }}>{stats.avgReliefMinutes}</span>
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
                width: 14, textAlign: 'center', fontFamily: 'DIN, sans-serif',
              }}>
                {idx + 1}
              </span>
              <span style={{ flex: 1, fontSize: 10, color: '#E2E8F0' }}>{item.name}</span>
              <span style={{ fontSize: 10, color: '#2ED573', fontWeight: 600, fontFamily: 'DIN, sans-serif' }}>
                {item.avgMinutes} 分钟
              </span>
            </div>
          ))}
        </div>
      </div>
    </CollapsibleCard>
  );
}
