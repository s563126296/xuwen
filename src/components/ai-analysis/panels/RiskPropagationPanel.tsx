import { Network } from 'lucide-react';
import { useAIAnalysisStore } from '../../../stores';

export default function RiskPropagationPanel() {
  const riskPropagation = useAIAnalysisStore((s) => s.riskPropagation);

  const typeConfig = {
    port: { label: '港口', color: '#F87171' },
    road: { label: '道路', color: '#FBBF24' },
    intersection: { label: '路口', color: '#4DA6FF' },
    area: { label: '区域', color: '#A78BFA' },
  };

  return (
    <div className="ai-panel ai-panel--half" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="ai-panel__header" style={{ flexShrink: 0 }}>
        <Network size={15} />
        <h3>港城风险传导</h3>
        <span className="ai-panel__badge">链路</span>
      </div>

      <div className="ai-panel__body" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <div className="risk-propagation">
          <div className="propagation-graph">
            {riskPropagation.map((node, index) => {
              const config = typeConfig[node.type];
              return (
                <div key={node.id} className="propagation-node">
                  <div
                    className="propagation-node__circle"
                    style={{
                      background: `rgba(${node.riskLevel > 70 ? '248,113,113' : node.riskLevel > 50 ? '251,146,60' : '52,211,153'}, 0.2)`,
                      border: `2px solid rgba(${node.riskLevel > 70 ? '248,113,113' : node.riskLevel > 50 ? '251,146,60' : '52,211,153'}, 0.6)`,
                    }}
                  >
                    <span className="propagation-node__name">{node.name}</span>
                    <span className="propagation-node__risk">{node.riskLevel}</span>
                  </div>
                  <span className="propagation-node__type" style={{ color: config.color }}>
                    {config.label}
                  </span>
                  {index < riskPropagation.length - 1 && (
                    <div className="propagation-arrow" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
