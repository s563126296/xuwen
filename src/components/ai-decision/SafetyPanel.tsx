import { useAIDecisionStore } from '../../stores/aiDecisionStore';

const riskLevelConfig = {
  low: { color: '#34d399', label: '低风险', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.25)' },
  medium: { color: '#fbbf24', label: '中风险', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.25)' },
  high: { color: '#fb923c', label: '高风险', bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.25)' },
  critical: { color: '#f87171', label: '严重风险', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.25)' },
};

const severityConfig = {
  low: { color: '#34d399', label: '低' },
  medium: { color: '#fbbf24', label: '中' },
  high: { color: '#f87171', label: '高' },
};

export default function SafetyPanel() {
  const safetyMetrics = useAIDecisionStore((s) => s.safetyMetrics);
  const riskConfig = riskLevelConfig[safetyMetrics.riskLevel];

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
          安全监测
        </h3>
      </div>

      {/* Metrics grid */}
      <div style={{
        flexShrink: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
        marginBottom: 12,
      }}>
        <div style={{
          padding: '8px 10px',
          borderRadius: 6,
          background: 'rgba(251,191,36,0.08)',
          border: '1px solid rgba(251,191,36,0.15)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 18, fontFamily: 'var(--font-data, JetBrains Mono)', color: '#fbbf24', fontWeight: 700 }}>
            {safetyMetrics.violations}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>今日违法</div>
        </div>
        <div style={{
          padding: '8px 10px',
          borderRadius: 6,
          background: 'rgba(248,113,113,0.08)',
          border: '1px solid rgba(248,113,113,0.15)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 18, fontFamily: 'var(--font-data, JetBrains Mono)', color: '#f87171', fontWeight: 700 }}>
            {safetyMetrics.accidents}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>今日事故</div>
        </div>
        <div style={{
          padding: '8px 10px',
          borderRadius: 6,
          background: 'rgba(77,166,255,0.08)',
          border: '1px solid rgba(77,166,255,0.15)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 18, fontFamily: 'var(--font-data, JetBrains Mono)', color: '#4da6ff', fontWeight: 700 }}>
            {safetyMetrics.aiWarnings}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>AI预警</div>
        </div>
      </div>

      {/* Risk level indicator */}
      <div style={{
        flexShrink: 0,
        padding: 12,
        borderRadius: 8,
        background: riskConfig.bg,
        border: `1px solid ${riskConfig.border}`,
        marginBottom: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>当前风险等级</span>
        <span style={{
          fontSize: 14,
          fontWeight: 700,
          color: riskConfig.color,
          textShadow: `0 0 10px ${riskConfig.color}40`,
        }}>
          {riskConfig.label}
        </span>
      </div>

      {/* Recent events list */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8, flexShrink: 0 }}>
          近期事件
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {safetyMetrics.recentEvents.map((event) => {
            const sevConfig = severityConfig[event.severity];
            return (
              <div
                key={event.id}
                style={{
                  padding: 8,
                  borderRadius: 6,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: sevConfig.color,
                  flexShrink: 0,
                  boxShadow: `0 0 8px ${sevConfig.color}60`,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: sevConfig.color,
                      padding: '1px 4px',
                      borderRadius: 3,
                      background: `${sevConfig.color}15`,
                    }}>
                      {event.type}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                      {event.time}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {event.location}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
