import { useAIDecisionStore } from '../../stores/aiDecisionStore';

export default function CausalReasoningPanel() {
  const causalChain = useAIDecisionStore((s) => s.causalChain);

  const nodeColors = [
    'var(--color-primary)',
    'var(--color-accent)',
    'var(--color-danger)',
  ];

  const nodeLabels = ['港口释放', '通道压力', '城区拥堵'];
  const nodeUnits = ['辆/时', '拥堵指数', '% 传导率'];

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
      <div style={{ flexShrink: 0, marginBottom: 16 }}>
        <h3 style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text-primary)',
        }}>
          因果推理链
        </h3>
        <p style={{
          margin: '4px 0 0',
          fontSize: 11,
          color: 'var(--text-tertiary)',
        }}>
          港口 - 通道 - 城区 压力传导分析
        </p>
      </div>

      {/* Causal chain visualization */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* Node chain */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 20,
        }}>
          {causalChain.map((node, i) => (
            <div key={node.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              {/* Node */}
              <div style={{
                flex: 1,
                padding: '12px 8px',
                borderRadius: 10,
                background: `rgba(${i === 0 ? '77,166,255' : i === 1 ? '240,180,41' : '248,113,113'},0.08)`,
                border: `1px solid ${nodeColors[i]}33`,
                textAlign: 'center',
                position: 'relative',
              }}>
                <div style={{
                  fontSize: 11,
                  color: nodeColors[i],
                  fontWeight: 600,
                  marginBottom: 6,
                }}>
                  {nodeLabels[i]}
                </div>
                <div style={{
                  fontSize: 20,
                  fontFamily: 'var(--font-data, JetBrains Mono)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  textShadow: `0 0 12px ${nodeColors[i]}40`,
                }}>
                  {node.value}
                </div>
                <div style={{
                  fontSize: 9,
                  color: 'var(--text-tertiary)',
                  marginTop: 2,
                }}>
                  {nodeUnits[i]}
                </div>
                <div style={{
                  marginTop: 6,
                  fontSize: 9,
                  color: 'var(--text-secondary)',
                  background: `${nodeColors[i]}15`,
                  borderRadius: 4,
                  padding: '2px 6px',
                  display: 'inline-block',
                }}>
                  置信度 {node.confidence}%
                </div>
              </div>

              {/* Arrow between nodes */}
              {i < causalChain.length - 1 && (
                <div style={{
                  width: 40,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="40" height="24" viewBox="0 0 40 24">
                    <defs>
                      <linearGradient id={`arrowGrad${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={nodeColors[i]} stopOpacity="0.6" />
                        <stop offset="100%" stopColor={nodeColors[i + 1]} stopOpacity="0.6" />
                      </linearGradient>
                    </defs>
                    <line x1="4" y1="12" x2="30" y2="12" stroke={`url(#arrowGrad${i})`} strokeWidth="2" />
                    <polygon points="30,6 38,12 30,18" fill={nodeColors[i + 1]} opacity="0.6" />
                    {/* Animated dot */}
                    <circle r="2.5" fill={nodeColors[i + 1]} opacity="0.8">
                      <animate attributeName="cx" from="4" to="34" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Causal descriptions */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          {causalChain.map((node, i) => (
            <div key={`desc-${node.id}`} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: nodeColors[i],
                flexShrink: 0,
              }} />
              <div style={{
                fontSize: 11,
                color: 'var(--text-secondary)',
                flex: 1,
              }}>
                {node.description}
              </div>
              <div style={{
                fontSize: 10,
                fontFamily: 'var(--font-data, JetBrains Mono)',
                color: nodeColors[i],
                flexShrink: 0,
              }}>
                {node.cause} {'->'} {node.effect}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom stats */}
      <div style={{
        flexShrink: 0,
        marginTop: 12,
        paddingTop: 10,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>主要因子</div>
          <div style={{ fontSize: 13, fontFamily: 'var(--font-data, JetBrains Mono)', color: 'var(--text-primary)' }}>
            港口放行
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>贡献度</div>
          <div style={{ fontSize: 13, fontFamily: 'var(--font-data, JetBrains Mono)', color: 'var(--color-primary)' }}>
            68%
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>传导时滞</div>
          <div style={{ fontSize: 13, fontFamily: 'var(--font-data, JetBrains Mono)', color: 'var(--color-accent)' }}>
            15-25min
          </div>
        </div>
      </div>
    </div>
  );
}
