import { useAIDecisionStore } from '../../stores/aiDecisionStore';

const priorityConfig = {
  high: { color: '#f87171', label: '高', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.25)' },
  medium: { color: '#fbbf24', label: '中', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.25)' },
  low: { color: '#4da6ff', label: '低', bg: 'rgba(77,166,255,0.12)', border: 'rgba(77,166,255,0.25)' },
};

function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return '#4da6ff';
  if (confidence >= 70) return '#a78bfa';
  if (confidence >= 60) return '#f0b429';
  return '#94a3b8';
}

export default function AIRecommendationPanel() {
  const recommendations = useAIDecisionStore((s) => s.recommendations);

  const avgConfidence = Math.round(
    recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length
  );
  const highCount = recommendations.filter((r) => r.priority === 'high').length;

  return (
    <div
      className="glass-panel"
      style={{
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ flexShrink: 0, marginBottom: 12 }}>
        <h3 style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text-primary)',
        }}>
          AI 建议
        </h3>
      </div>

      {/* Summary stats */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        gap: 12,
        marginBottom: 12,
      }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 18, fontFamily: 'var(--font-data, JetBrains Mono)', color: 'var(--text-primary)', textShadow: 'var(--glow-primary)' }}>
            {recommendations.length}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>今日建议</div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 18, fontFamily: 'var(--font-data, JetBrains Mono)', color: 'var(--color-success)', textShadow: 'var(--glow-success)' }}>
            {avgConfidence}%
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>平均置信度</div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 18, fontFamily: 'var(--font-data, JetBrains Mono)', color: '#f87171' }}>
            {highCount}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>高优先级</div>
        </div>
      </div>

      {/* Recommendation cards */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {recommendations.map((rec) => {
          const pConfig = priorityConfig[rec.priority];
          return (
            <div
              key={rec.id}
              style={{
                padding: 10,
                borderRadius: 8,
                background: 'rgba(77,166,255,0.04)',
                border: '1px solid rgba(77,166,255,0.1)',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.15)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(77,166,255,0.1)'; }}
            >
              {/* Title row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                  <span style={{
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 4,
                    color: pConfig.color,
                    background: pConfig.bg,
                    border: `1px solid ${pConfig.border}`,
                    flexShrink: 0,
                  }}>
                    {pConfig.label}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>
                    {rec.title}
                  </span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)', flexShrink: 0, marginLeft: 8 }}>
                  {rec.timestamp}
                </span>
              </div>

              {/* Description */}
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>
                {rec.description}
              </div>

              {/* Confidence bar */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>置信度</span>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-data, JetBrains Mono)', color: getConfidenceColor(rec.confidence) }}>
                    {rec.confidence}%
                  </span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${rec.confidence}%`,
                    background: getConfidenceColor(rec.confidence),
                    borderRadius: 2,
                    transition: 'width 0.3s',
                  }} />
                </div>
              </div>

              {/* Category tag + impact */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: 10,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: 'rgba(77,166,255,0.08)',
                  color: 'var(--color-primary)',
                  border: '1px solid rgba(77,166,255,0.15)',
                }}>
                  {rec.category}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                  影响力 <span style={{ fontFamily: 'var(--font-data, JetBrains Mono)', color: 'var(--color-accent)' }}>{rec.impact}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
