import { AlertTriangle, ArrowRight, BrainCircuit, CheckCircle2, Gauge, Route } from 'lucide-react';
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
  const primaryRecommendation = recommendations[0];

  return (
    <div className="decision-sandbox">
      <div className="decision-sandbox__header">
        <div>
          <span className="decision-sandbox__eyebrow">AI推演沙盘</span>
          <h3>从交通态势到可执行策略</h3>
        </div>
        <div className="decision-sandbox__impact">
          <span>首选方案</span>
          <strong>{primaryRecommendation?.title}</strong>
        </div>
      </div>

      <div className="decision-sandbox__cards">
        <section className="sandbox-card sandbox-card--state">
          <div className="sandbox-card__title">
            <Gauge size={14} />
            <span>业务态势</span>
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
          <div className="sandbox-card__route">
            <Route size={14} />
            <span>徐闻港 → 进港大道 → 城区主干道</span>
          </div>
        </section>

        <section className="sandbox-card sandbox-card--center">
          <div className="sandbox-card__title">
            <BrainCircuit size={14} />
            <span>模型研判链路</span>
          </div>
          <div className="sandbox-reasoning">
            {reasoningProcess.map((step, index) => (
              <div key={step.id} className={`reasoning-step reasoning-step--${step.status}`}>
                <div className="reasoning-step__index">
                  {step.status === 'completed' ? <CheckCircle2 size={12} /> : index + 1}
                </div>
                <div className="reasoning-step__content">
                  <strong>{step.step}</strong>
                  <span>{step.description}</span>
                  {step.status === 'completed' && step.confidence > 0 && (
                    <em>置信度 {step.confidence}%</em>
                  )}
                </div>
                <div className="reasoning-step__bar" style={{ ['--confidence' as string]: `${step.confidence || 34}%` }} />
              </div>
            ))}
          </div>
          <div className="sandbox-dataflow" />
        </section>

        <section className="sandbox-card sandbox-card--recommend">
          <div className="sandbox-card__title">
            <AlertTriangle size={14} />
            <span>策略收益评估</span>
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
                  <div>
                    <span>执行风险</span>
                    <span>{rec.risk}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="sandbox-arrows">
        <ArrowRight className="sandbox-arrow" size={20} />
        <ArrowRight className="sandbox-arrow" size={20} />
      </div>
    </div>
  );
}
