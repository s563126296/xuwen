import { useCommandStore } from '../../stores/commandStore';

const statusColors = {
  'on-track': '#2ED573',
  'off-track': '#FF4757',
  'pending': '#94A3B8',
};

const statusLabels = {
  'on-track': '达标',
  'off-track': '偏离',
  'pending': '待验证',
};

const overallStatusConfig = {
  executing: { label: '执行中', color: '#F5A623' },
  'on-track': { label: '符合预期', color: '#2ED573' },
  'off-track': { label: '偏离预期', color: '#FF4757' },
  completed: { label: '已完成', color: '#2ED573' },
};

export default function StrategyTimelinePanel() {
  const strategyTimeline = useCommandStore((s) => s.commandState.strategyTimeline);

  if (!strategyTimeline) return null;

  const { strategyName, startTime, checkpoints, overallStatus } = strategyTimeline;
  const statusCfg = overallStatusConfig[overallStatus];

  // Calculate current deviation from the first checkpoint that has actual data
  const latestActual = [...checkpoints].reverse().find((cp) => cp.actual !== null);
  const deviation = latestActual ? (latestActual.actual! - latestActual.expected).toFixed(1) : null;
  const deviationSign = deviation && parseFloat(deviation) > 0 ? '+' : '';

  // Starting congestion index (current value before strategy)
  const startIndex = 6.8;

  return (
    <div style={{
      background: '#0D1137',
      border: '1px solid rgba(0, 208, 233, 0.2)',
      borderRadius: 8,
      padding: 16,
      width: '100%',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#94A3B8', fontSize: 12 }}>策略效果追踪</span>
          <span style={{ color: '#E2E8F0', fontSize: 13, fontWeight: 600 }}>
            {strategyName}
          </span>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 500, padding: '2px 8px',
          borderRadius: 4,
          color: statusCfg.color,
          backgroundColor: `${statusCfg.color}1A`,
          border: `1px solid ${statusCfg.color}40`,
        }}>
          {statusCfg.label}
        </span>
      </div>

      {/* Timeline visualization */}
      <div style={{ position: 'relative', padding: '0 8px' }}>
        {/* Labels row: time intervals */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 6,
        }}>
          <span style={{ fontSize: 10, color: '#64748B' }}>起始 {startIndex}</span>
          {checkpoints.map((cp) => (
            <span key={cp.time} style={{ fontSize: 10, color: '#64748B' }}>
              {cp.minutesAfter}min
            </span>
          ))}
        </div>

        {/* Timeline line + dots */}
        <div style={{
          position: 'relative', height: 20,
          display: 'flex', alignItems: 'center',
        }}>
          {/* Background line */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: '50%',
            height: 2, backgroundColor: 'rgba(148, 163, 184, 0.3)',
            transform: 'translateY(-50%)',
          }} />
          {/* Expected dashed line */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: '50%',
            height: 2,
            backgroundImage: 'repeating-linear-gradient(to right, #00D0E9 0, #00D0E9 6px, transparent 6px, transparent 12px)',
            transform: 'translateY(-50%)',
            opacity: 0.5,
          }} />
          {/* Dots */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', width: '100%',
            position: 'relative', zIndex: 1,
          }}>
            {/* Start dot */}
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              backgroundColor: '#00D0E9',
              boxShadow: '0 0 6px rgba(0, 208, 233, 0.6)',
            }} />
            {/* Checkpoint dots */}
            {checkpoints.map((cp) => {
              const dotColor = statusColors[cp.status];
              const isExecuting = cp.status === 'on-track' && overallStatus === 'executing';
              return (
                <div key={cp.time} style={{
                  width: 10, height: 10, borderRadius: '50%',
                  backgroundColor: dotColor,
                  boxShadow: isExecuting ? `0 0 8px ${dotColor}` : 'none',
                  animation: isExecuting ? 'pulse 2s infinite' : 'none',
                }} />
              );
            })}
          </div>
        </div>

        {/* Time labels */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 4,
        }}>
          <span style={{ fontSize: 10, color: '#94A3B8' }}>{startTime}</span>
          {checkpoints.map((cp) => (
            <span key={cp.time} style={{ fontSize: 10, color: '#94A3B8' }}>
              {cp.time}
            </span>
          ))}
        </div>

        {/* Expected values */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 4,
        }}>
          <span style={{ fontSize: 10, color: '#00D0E9' }}></span>
          {checkpoints.map((cp) => (
            <span key={cp.time} style={{ fontSize: 10, color: '#00D0E9' }}>
              预期 {cp.expected}
            </span>
          ))}
        </div>

        {/* Actual values */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 2,
        }}>
          <span style={{ fontSize: 10, color: '#FFFFFF' }}></span>
          {checkpoints.map((cp) => (
            <span key={cp.time} style={{
              fontSize: 10,
              color: cp.actual !== null ? '#FFFFFF' : '#64748B',
            }}>
              {cp.actual !== null ? `实际 ${cp.actual}` : '待观测'}
            </span>
          ))}
        </div>

        {/* Status labels */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 2,
        }}>
          <span style={{ fontSize: 10 }}></span>
          {checkpoints.map((cp) => (
            <span key={cp.time} style={{
              fontSize: 10,
              color: statusColors[cp.status],
            }}>
              {cp.status === 'on-track' && '✓ '}
              {cp.status === 'pending' && '◦ '}
              {cp.status === 'off-track' && '✗ '}
              {statusLabels[cp.status]}
            </span>
          ))}
        </div>
      </div>

      {/* Footer: deviation + confidence */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 12, paddingTop: 10,
        borderTop: '1px solid rgba(148, 163, 184, 0.1)',
      }}>
        <span style={{ fontSize: 11, color: '#94A3B8' }}>
          {deviation !== null ? (
            <>当前偏差：<span style={{
              color: Math.abs(parseFloat(deviation)) <= 0.3 ? '#2ED573' : '#FF4757',
            }}>{deviationSign}{deviation}</span>
            <span style={{ color: '#64748B' }}>
              {Math.abs(parseFloat(deviation)) <= 0.3 ? '（可接受范围内）' : '（超出预期）'}
            </span></>
          ) : '暂无实际数据'}
        </span>
        <span style={{ fontSize: 11, color: '#94A3B8' }}>
          AI 置信度：<span style={{ color: '#00D0E9' }}>85%</span>
        </span>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
