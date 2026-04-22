import { History } from 'lucide-react';
import CollapsibleCard from '../../common/CollapsibleCard';
import { dinFont } from './strategyConstants';
import HistoryItem from './HistoryItem';

export default function HistoryEffectsSection({ historyEffects }: {
  historyEffects: Array<{ name: string; rate: number; color: string }>;
}) {
  const summary = (
    <div style={{ fontSize: 10, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)' }}>
      采纳率 <span style={{ fontFamily: 'DIN, sans-serif', color: '#2ED573' }}>82%</span> · 平均缓解 <span style={{ fontFamily: 'DIN, sans-serif', color: '#E2E8F0' }}>28</span> 分钟
    </div>
  );

  return (
    <CollapsibleCard
      title="历史策略效果"
      icon={<History size={12} style={{ color: '#4da6ff' }} />}
      summary={summary}
      defaultExpanded={false}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: '#64748B' }}>策略采纳率</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#2ED573', fontFamily: dinFont, textShadow: '0 0 6px rgba(16,185,129,0.2)' }}>82%</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: '#64748B' }}>平均缓解时间</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#E2E8F0', fontFamily: dinFont, textShadow: '0 0 6px rgba(0,240,255,0.1)' }}>28 分钟</span>
      </div>
      <div style={{ height: 1, background: '#1E293B', margin: '6px 0' }} />
      {historyEffects.map((h) => (
        <HistoryItem key={h.name} name={h.name} rate={h.rate} color={h.color} />
      ))}
    </CollapsibleCard>
  );
}
