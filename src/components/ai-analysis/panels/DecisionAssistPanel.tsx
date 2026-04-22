import { Lightbulb } from 'lucide-react';
import { useAIAnalysisStore } from '../../../stores';

export default function DecisionAssistPanel() {
  const topRecommendation = useAIAnalysisStore((s) => s.topRecommendation);
  const alternativeStrategies = useAIAnalysisStore((s) => s.alternativeStrategies);

  const priorityConfig = {
    high: { label: '高优先级', color: '#F87171' },
    medium: { label: '中优先级', color: '#FBBF24' },
    low: { label: '低优先级', color: '#94A3B8' },
  };

  return (
    <div className="ai-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="ai-panel__header" style={{ flexShrink: 0 }}>
        <Lightbulb size={15} />
        <h3>智能决策辅助</h3>
        <span className="ai-panel__badge">象限C</span>
      </div>

      <div className="ai-panel__body" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {/* 首要推荐 */}
        <div className="top-recommendation">
          <div className="top-recommendation__badge">
            <span style={{ color: priorityConfig[topRecommendation.priority].color }}>
              {priorityConfig[topRecommendation.priority].label}
            </span>
            <em>置信度 {topRecommendation.confidence}%</em>
          </div>
          <h4>{topRecommendation.title}</h4>
          <p>{topRecommendation.description}</p>
          <div className="top-recommendation__metrics">
            <div className="recommendation-metric">
              <span>预期影响</span>
              <strong>{topRecommendation.impact}%</strong>
            </div>
            <div className="recommendation-metric">
              <span>置信度</span>
              <strong>{topRecommendation.confidence}%</strong>
            </div>
          </div>
        </div>

        {/* 备选方案 */}
        <div className="alternative-strategies">
          <div className="alternative-strategies__title">备选方案对比</div>
          {alternativeStrategies.map((strategy) => (
            <div key={strategy.id} className="strategy-card">
              <div className="strategy-card__header">
                <strong>{strategy.name}</strong>
                <div className="strategy-metrics">
                  <span className="strategy-metric strategy-metric--effectiveness">
                    效果 {strategy.effectiveness}%
                  </span>
                  <span className="strategy-metric strategy-metric--cost">
                    成本 {strategy.cost}%
                  </span>
                </div>
              </div>
              <p className="strategy-description">{strategy.description}</p>
              <div className="strategy-pros-cons">
                <div className="strategy-pros">
                  <span>优势</span>
                  <ul>
                    {strategy.pros.slice(0, 2).map((pro, i) => (
                      <li key={i}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div className="strategy-cons">
                  <span>风险</span>
                  <ul>
                    {strategy.cons.slice(0, 2).map((con, i) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
