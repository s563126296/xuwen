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
  const aiSummary = useOverviewStore((s) => s.aiSummary);
  const { windows, drivingFactor } = shutdownProbability;
  const noIntervention = aiSummary.noInterventionForecast;
  const accuracy = aiSummary.learningStats?.predictionAccuracy ?? 84;

  const summary = (
    <div style={{ fontSize: 11, color: '#C9CDD4', fontFamily: 'var(--font-data, JetBrains Mono)', display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
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
      defaultExpanded={true}
      title="停航风险预测"
      icon={<AlertTriangle size={12} color="#4da6ff" />}
      summary={summary}
      delay={delay}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {windows.map((w, i) => {
          const color = levelColors[w.level];
          return (
            <div key={i} style={{
              padding: '8px 10px', borderRadius: 6,
              background: 'rgba(0, 208, 233, 0.08)', border: '1px solid rgba(0, 208, 233, 0.15)',
            }}>
              <div style={{ fontSize: 11, color: '#A0A8B4', marginBottom: 4 }}>{w.hours}h内</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${w.probability}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
                </div>
                <span style={{ fontFamily: 'DIN, sans-serif', fontWeight: 700, fontSize: 12, color, minWidth: 32, textAlign: 'right' }}>{w.probability}%</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 6, fontSize: 11, color: '#A0A8B4', padding: '4px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: 4 }}>
        驱动因素：{drivingFactor}
      </div>
      {/* v2.0: AI prediction badge + no-intervention comparison */}
      <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '2px 8px', borderRadius: 4,
          background: 'rgba(168, 85, 247, 0.1)',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          fontSize: 10, color: '#A855F7', fontWeight: 600,
        }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#A855F7', animation: 'aiPulse 2s infinite' }} />
          AI 预测
        </div>
        {noIntervention && (
          <div style={{ fontSize: 10, color: '#94A3B8' }}>
            不干预预计 {noIntervention.congestionIndex1h} · 准确率 {accuracy}%
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
}
