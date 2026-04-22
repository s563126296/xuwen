import { AlertTriangle, ArrowRight, Gauge, TrendingUp } from 'lucide-react';
import { useAIAnalysisStore } from '../../stores';

export default function DecisionSandbox() {
  const currentState = useAIAnalysisStore((s) => s.currentState);
  const reasoningProcess = useAIAnalysisStore((s) => s.reasoningProcess);
  const recommendations = useAIAnalysisStore((s) => s.recommendations);

  const riskLevelConfig = {
    low: { label: '低', color: '#34D399' },
    medium: { label: '中', color: '#FBBF24' },
    high: { label: '高', color: '#FB923C' },
    critical: { label: '极高', color: '#F87171' },
  };

  const riskConfig = riskLevelConfig[currentState.riskLevel];

  return (
    <div className="decision-sandbox">
      <div className="decision-sandbox__header">
        <h3>AI决策推演沙盘</h3>
        <span>当前态势 → AI推演 → 决策建议</span>
      </div>

      <div className="decision-sandbox__cards">
        {/* 左卡片：当前态势 */}
        <div className="sandbox-card">
          <div className="sandbox-card__title">
            <Gauge size={14} />
            <span>当前态势</span>
          </div>
          <div className="sandbox-card__metrics">
            <div className="sandbox-metric">
              <span>拥堵指数</span>
              <strong>{currentState.congestionIndex.toFixed(2)}</strong>
            </div>
            <div className="sandbox-metric">
              <span>港口排队</span>
              <strong>{currentState.portQueue}辆</strong>
            </div>
            <div className="sandbox-metric">
              <span>城区流量</span>
              <strong>{currentState.cityFlow}辆/h</strong>
            </div>
            <div className="sandbox-metric">
              <span>风险等级</span>
              <strong style={{ color: riskConfig.color }}>{riskConfig.label}</strong>
            </div>
          </div>
        </div>

        {/* 中卡片：AI推演过程 */}
        <div className="sandbox-card sandbox-card--center">
          <div className="sandbox-card__title">
            <TrendingUp size={14} />
            <span>AI推演过程</span>
          </div>
          <div className="sandbox-reasoning">
            {reasoningProcess.map((step, index) => (
              <div key={step.id} className={`reasoning-step reasoning-step--${step.status}`}>
                <div className="reasoning-step__index">{index + 1}</div>
                <div className="reasoning-step__content">
                  <strong>{step.step}</strong>
                  <span>{step.description}</span>
                  {step.status === 'completed' && step.confidence > 0 && (
                    <em>置信度 {step.confidence}%</em>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="sandbox-dataflow" />
        </div>

        {/* 右卡片：决策建议 */}
        <div className="sandbox-card">
          <div className="sandbox-card__title">
            <AlertTriangle size={14} />
            <span>决策建议</span>
          </div>
          <div className="sandbox-recommendations">
            {recommendations.map((rec, index) => (
              <div key={rec.id} className="sandbox-recommendation">
                <div className="sandbox-recommendation__header">
                  <span className="sandbox-recommendation__rank">#{index + 1}</span>
                  <strong>{rec.title}</strong>
                  <em>{rec.confidence}%</em>
                </div>
                <p>{rec.description}</p>
                <div className="sandbox-recommendation__details">
                  <div>
                    <span>预期影响</span>
                    <span>{rec.impact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 数据流动箭头 */}
      <div className="sandbox-arrows">
        <ArrowRight className="sandbox-arrow" size={20} />
        <ArrowRight className="sandbox-arrow" size={20} />
      </div>
    </div>
  );
}
