import { Activity, AlertTriangle, BrainCircuit, CheckCircle2, GitBranch, Lightbulb, ShieldCheck, TrendingDown } from 'lucide-react';
import { useAIAnalysisStore } from '../../../stores';

const mapProblems = [
  {
    id: 'port',
    title: '港口积压热区',
    location: '徐闻港待渡区',
    symptom: '待渡车辆2847辆，入口排队向进港大道外溢',
    cause: '港口放行波次与进港通道承载不匹配',
    strategy: '先控入口节奏，再打开S376分流',
    level: 'critical',
  },
  {
    id: 'road',
    title: '进港大道高压段',
    location: '进港大道K3+500',
    symptom: '拥堵3.2km，45分钟预测仍处高位',
    cause: '港口释放车辆与城区穿行车辆叠加',
    strategy: '南向绿信比提升至65%，削峰不截流',
    level: 'high',
  },
  {
    id: 'city',
    title: '城区承压扩散',
    location: '县城主干道',
    symptom: '承压指数65，港口波次约20分钟后传导至城区',
    cause: '主通道尾部回溢影响城区关键路口',
    strategy: '提前启用外围诱导，减少城区穿越流量',
    level: 'medium',
  },
];

const effectMetrics = [
  { label: '拥堵下降', value: '0.6-0.8', unit: '指数', tone: 'success' },
  { label: '排队缩短', value: '1.2', unit: 'km', tone: 'primary' },
  { label: '见效时间', value: '15', unit: 'min', tone: 'warning' },
  { label: '执行置信', value: '88', unit: '%', tone: 'success' },
];

const levelConfig = {
  critical: { label: '严重', color: '#ff4757' },
  high: { label: '高压', color: '#f5a623' },
  medium: { label: '扩散', color: '#00d0e9' },
};

export default function DecisionAssistPanel() {
  const topRecommendation = useAIAnalysisStore((s) => s.topRecommendation);
  const alternativeStrategies = useAIAnalysisStore((s) => s.alternativeStrategies);
  const recommendations = useAIAnalysisStore((s) => s.recommendations);
  const reasoningProcess = useAIAnalysisStore((s) => s.reasoningProcess);

  const primaryRecommendation = recommendations[0];

  return (
    <div className="ai-panel ai-panel--strategy" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="ai-panel__header" style={{ flexShrink: 0 }}>
        <Lightbulb size={15} />
        <h3>策略效能评估</h3>
        <span className="ai-panel__badge">AI建议</span>
      </div>

      <div className="ai-panel__body strategy-eval" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <section className="strategy-eval__primary">
          <div className="strategy-eval__primary-head">
            <div>
              <span>首选处置策略</span>
              <strong>{topRecommendation.title}</strong>
            </div>
            <em>{topRecommendation.confidence}%</em>
          </div>
          <p>{topRecommendation.description}</p>
          <div className="strategy-eval__metrics">
            {effectMetrics.map((metric) => (
              <div key={metric.label} className={`strategy-eval-metric strategy-eval-metric--${metric.tone}`}>
                <span>{metric.label}</span>
                <strong>{metric.value}<small>{metric.unit}</small></strong>
              </div>
            ))}
          </div>
        </section>

        <section className="strategy-eval__section">
          <div className="strategy-eval__section-title">
            <AlertTriangle size={13} />
            <span>地图风险问题</span>
          </div>
          <div className="strategy-problem-list">
            {mapProblems.map((problem) => {
              const level = levelConfig[problem.level as keyof typeof levelConfig];
              return (
                <div key={problem.id} className={`strategy-problem strategy-problem--${problem.level}`}>
                  <div className="strategy-problem__head">
                    <strong>{problem.title}</strong>
                    <span style={{ color: level.color }}>{level.label}</span>
                  </div>
                  <em>{problem.location}</em>
                  <p>{problem.symptom}</p>
                  <div className="strategy-problem__cause">
                    <GitBranch size={12} />
                    <span>{problem.cause}</span>
                  </div>
                  <div className="strategy-problem__action">
                    <CheckCircle2 size={12} />
                    <span>{problem.strategy}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="strategy-eval__section">
          <div className="strategy-eval__section-title">
            <BrainCircuit size={13} />
            <span>AI推演依据</span>
          </div>
          <div className="strategy-reasoning">
            {reasoningProcess.map((step) => (
              <div key={step.id} className={`strategy-reasoning__step strategy-reasoning__step--${step.status}`}>
                <span />
                <div>
                  <strong>{step.step}</strong>
                  <em>{step.description}</em>
                </div>
                {step.confidence > 0 && <small>{step.confidence}%</small>}
              </div>
            ))}
          </div>
        </section>

        <section className="strategy-eval__section">
          <div className="strategy-eval__section-title">
            <Activity size={13} />
            <span>方案效能对比</span>
          </div>
          <div className="strategy-score-list">
            {alternativeStrategies.map((strategy) => (
              <div key={strategy.id} className="strategy-score">
                <div className="strategy-score__head">
                  <strong>{strategy.name}</strong>
                  <span>成本 {strategy.cost}%</span>
                </div>
                <p>{strategy.description}</p>
                <div className="strategy-score__bar">
                  <i style={{ width: `${strategy.effectiveness}%` }} />
                </div>
                <div className="strategy-score__meta">
                  <span>效果 {strategy.effectiveness}%</span>
                  <span>{strategy.pros[0]}</span>
                  <span>{strategy.cons[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="strategy-eval__section strategy-eval__section--final">
          <div className="strategy-eval__section-title">
            <ShieldCheck size={13} />
            <span>执行建议</span>
          </div>
          <div className="strategy-final">
            <TrendingDown size={18} />
            <div>
              <strong>{primaryRecommendation?.title}</strong>
              <p>{primaryRecommendation?.impact}</p>
              <span>{primaryRecommendation?.risk}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
