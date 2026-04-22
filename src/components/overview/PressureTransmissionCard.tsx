import { GitBranch } from 'lucide-react';
import { useOverviewStore } from '../../stores/overviewStore';
import type { PressureOverallStatus } from '../../stores/overviewStore';
import CollapsibleCard from '../common/CollapsibleCard';

const nodeLabels = ['港口', '进港通道', '城区', '全域'] as const;
const nodeKeys = ['port', 'corridor', 'city', 'citywide'] as const;

// 按压力分值分级着色：≥70 红 / ≥50 橙 / ≥30 黄 / <30 绿
function getScoreStyle(score: number, active: boolean) {
  if (!active && score < 20) {
    return { color: '#A0A8B4', border: 'rgba(255,255,255,0.15)', bg: 'rgba(255,255,255,0.05)', glow: 'none', labelColor: '#A0A8B4' };
  }
  if (score >= 70) {
    return { color: '#FF4757', border: '#FF4757', bg: 'rgba(255, 71, 87, 0.18)', glow: '0 0 12px rgba(255, 71, 87, 0.5)', labelColor: '#FF4757' };
  }
  if (score >= 50) {
    return { color: '#FF6B35', border: '#FF6B35', bg: 'rgba(255, 107, 53, 0.18)', glow: '0 0 12px rgba(255, 107, 53, 0.45)', labelColor: '#FFC7A8' };
  }
  if (score >= 30) {
    return { color: '#F5A623', border: '#F5A623', bg: 'rgba(245, 166, 35, 0.18)', glow: '0 0 10px rgba(245, 166, 35, 0.4)', labelColor: '#F5D18B' };
  }
  return { color: '#2ED573', border: '#2ED573', bg: 'rgba(46, 213, 115, 0.15)', glow: '0 0 8px rgba(46, 213, 115, 0.35)', labelColor: '#9FE8BB' };
}

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
    <div style={{ fontSize: 11, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)', display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
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
      icon={<GitBranch size={12} color="#4da6ff" />}
      summary={summary}
      delay={delay}
    >
      {/* Chain */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, padding: '8px 0' }}>
        {nodes.map((n, i) => {
          const s = getScoreStyle(n.score, n.active);
          return (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: s.bg,
                border: `2px solid ${s.border}`,
                boxShadow: s.glow,
              }}>
                <span style={{ fontFamily: 'DIN, sans-serif', fontWeight: 700, fontSize: 12, color: s.color }}>{n.score}</span>
              </div>
              <span style={{ fontSize: 10, color: s.labelColor }}>{n.label}</span>
            </div>
            {i < nodes.length - 1 && (
              <div style={{ margin: '0 6px', marginBottom: 16, color: getScoreStyle(nodes[i + 1].score, nodes[i + 1].active).color, fontSize: 12, fontWeight: 700 }}>→</div>
            )}
          </div>
          );
        })}
      </div>
      {/* Status text */}
      <div style={{ fontSize: 11, color: '#A0A8B4', textAlign: 'center', padding: '4px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: 4 }}>
        {pressureTransmission.overallStatus === 'spreading'
          ? `蔓延中：港口待舶680辆 → 进港大道排队1.2km → 城东路口饱和度72%`
          : pressureTransmission.overallStatus === 'citywide'
          ? `全域拥堵：港口→通道→城区全线压力超限`
          : `传导中：港口待舶${pressureTransmission.port.score >= 40 ? '450辆' : '正常'} → 进港大道排队850m`}
      </div>
    </CollapsibleCard>
  );
}
