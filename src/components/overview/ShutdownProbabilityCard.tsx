import { AlertTriangle } from 'lucide-react';
import { useOverviewStore } from '../../stores/overviewStore';
import type { ShutdownLevel } from '../../stores/overviewStore';
import CollapsibleCard from '../common/CollapsibleCard';

const levelColors: Record<ShutdownLevel, string> = {
  low: '#2ED573',
  attention: '#F5A623',
  warning: '#FF6B35',
  danger: '#FF4757',
};

export default function ShutdownProbabilityCard({ delay = '0s' }: { delay?: string }) {
  const shutdownProbability = useOverviewStore((s) => s.shutdownProbability);
  const { windows, drivingFactor } = shutdownProbability;

  const summary = (
    <div style={{ fontSize: 12, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)', display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      {windows.map((w, i) => {
        const color = levelColors[w.level];
        return (
          <span key={i}>
            {w.hours}h <span style={{ color }}>{w.probability}%</span>
            {i < windows.length - 1 && <span style={{ color: '#A0A8B4' }}> · </span>}
          </span>
        );
      })}
    </div>
  );

  return (
    <CollapsibleCard
      title="停航风险预测"
      icon={<AlertTriangle size={14} color="#4da6ff" />}
      summary={summary}
      delay={delay}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {windows.map((w, i) => {
          const color = levelColors[w.level];
          return (
            <div key={i} style={{
              padding: '8px 10px', borderRadius: 6,
              background: 'rgba(0, 208, 233, 0.08)', border: '1px solid rgba(0, 208, 233, 0.15)',
            }}>
              <div style={{ fontSize: 12, color: '#A0A8B4', marginBottom: 4 }}>{w.hours}h内</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${w.probability}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                </div>
                <span style={{ fontFamily: 'DIN, sans-serif', fontWeight: 700, fontSize: 14, color, minWidth: 32, textAlign: 'right' }}>{w.probability}%</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: '#A0A8B4', padding: '4px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: 4 }}>
        驱动因素：{drivingFactor}
      </div>
    </CollapsibleCard>
  );
}
