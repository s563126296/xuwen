import { GitBranch } from 'lucide-react';
import { useAIAnalysisStore } from '../../../stores';

export default function CorrelationPanel() {
  const correlationInsights = useAIAnalysisStore((s) => s.correlationInsights);

  const strengthConfig = {
    strong: { label: '强相关', color: '#F87171' },
    medium: { label: '中相关', color: '#FBBF24' },
    weak: { label: '弱相关', color: '#94A3B8' },
  };

  return (
    <div className="ai-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="ai-panel__header" style={{ flexShrink: 0 }}>
        <GitBranch size={15} />
        <h3>相关性分析</h3>
        <span className="ai-panel__badge">象限A</span>
      </div>

      <div className="ai-panel__body" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <div className="correlation-list">
          {correlationInsights.map((insight) => {
            const config = strengthConfig[insight.strength];
            return (
              <div key={insight.id} className="correlation-item">
                <div className="correlation-item__header">
                  <span className="correlation-factor">{insight.factor1}</span>
                  <div className="correlation-arrow">
                    <div className="correlation-value" style={{ color: config.color }}>
                      {insight.correlation > 0 ? '+' : ''}
                      {insight.correlation.toFixed(2)}
                    </div>
                  </div>
                  <span className="correlation-factor">{insight.factor2}</span>
                </div>
                <p className="correlation-description">{insight.description}</p>
                <span className="correlation-strength" style={{ color: config.color }}>
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
