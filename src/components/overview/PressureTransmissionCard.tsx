import { GitBranch } from 'lucide-react';
import { useOverviewStore } from '../../stores/overviewStore';
import type { PressureOverallStatus } from '../../stores/overviewStore';
import CollapsibleCard from '../common/CollapsibleCard';

const nodeLabels = ['港口', '进港通道', '城区', '全域'] as const;
const nodeKeys = ['port', 'corridor', 'city', 'citywide'] as const;

const statusMap: Record<PressureOverallStatus, { label: string; color: string; bg: string }> = {
  decoupled: { label: '解耦', color: '#2ED573', bg: 'rgba(46, 213, 115, 0.15)' },
  transmitting: { label: '传导中', color: '#F5A623', bg: 'rgba(245, 166, 35, 0.15)' },
  spreading: { label: '蔓延', color: '#FF6B35', bg: 'rgba(255, 107, 53, 0.15)' },
  citywide: { label: '全域', color: '#FF4757', bg: 'rgba(255, 71, 87, 0.15)' },
};

export default function PressureTransmissionCard({ delay = '0s' }: { delay?: string }) {
  const pressureTransmission = useOverviewStore((s) => s.pressureTransmission);
  const nodes = nodeKeys.map((k, i) => ({ ...pressureTransmission[k], label: nodeLabels[i] }));
  const st = statusMap[pressureTransmission.overallStatus];

  const summary = (
    <div style={{ fontSize: 12, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)', display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      <span>港口 <span style={{ color: '#4da6ff' }}>{pressureTransmission.port.score}</span></span>
      <span style={{ color: '#A0A8B4' }}>→</span>
      <span>通道 <span style={{ color: '#4da6ff' }}>{pressureTransmission.corridor.score}</span></span>
      <span style={{ color: '#A0A8B4' }}>→</span>
      <span>城区 <span style={{ color: '#4da6ff' }}>{pressureTransmission.city.score}</span></span>
      <span style={{ color: '#A0A8B4' }}>·</span>
      <span style={{ color: st.color }}>{st.label}</span>
    </div>
  );

  return (
    <CollapsibleCard
      defaultExpanded={true}
      title="拥堵扩散情况"
      icon={<GitBranch size={14} color="#4da6ff" />}
      summary={summary}
      delay={delay}
    >
      {/* Chain */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, padding: '8px 0' }}>
        {nodes.map((n, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: n.active ? 'rgba(0, 208, 233, 0.2)' : 'rgba(255,255,255,0.05)',
                border: n.active ? '2px solid #00D0E9' : '1px solid rgba(255,255,255,0.15)',
                boxShadow: n.active ? '0 0 12px rgba(0, 208, 233, 0.4)' : 'none',
              }}>
                <span style={{ fontFamily: 'DIN, sans-serif', fontWeight: 700, fontSize: 14, color: n.active ? '#00D0E9' : '#A0A8B4' }}>{n.score}</span>
              </div>
              <span style={{ fontSize: 11, color: n.active ? '#C9CDD4' : '#A0A8B4' }}>{n.label}</span>
            </div>
            {i < nodes.length - 1 && (
              <div style={{ margin: '0 6px', marginBottom: 16, color: nodes[i + 1].active ? '#00D0E9' : '#A0A8B4', fontSize: 14, fontWeight: 700 }}>→</div>
            )}
          </div>
        ))}
      </div>
      {/* Status text */}
      <div style={{ fontSize: 12, color: '#A0A8B4', textAlign: 'center', padding: '4px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: 4 }}>
        传导中：港口待舶{pressureTransmission.port.score >= 40 ? '450辆' : '正常'} → 进港大道排队850m
      </div>
    </CollapsibleCard>
  );
}
