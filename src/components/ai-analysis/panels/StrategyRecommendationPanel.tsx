import { TrendingDown, Clock, Target } from 'lucide-react';

interface Strategy {
  id: string;
  name: string;
  confidence: number;
  metrics: {
    congestionReduction: string;
    queueReduction: string;
    effectTime: string;
  };
  relatedElements: string[];
  reasoning: string;
}

interface StrategyRecommendationPanelProps {
  selectedElementId?: string;
}

const mockStrategies: Strategy[] = [
  {
    id: 'strategy-1',
    name: 'S376 分流至海安新港',
    confidence: 92,
    metrics: {
      congestionReduction: '↓ 35%',
      queueReduction: '↓ 1200辆',
      effectTime: '15-20分钟'
    },
    relatedElements: ['problem-port-001', 'problem-road-001'],
    reasoning: '通过 S376 引导部分车辆至海安新港，可有效分流徐闻港压力，预计 15-20 分钟见效'
  },
  {
    id: 'strategy-2',
    name: '增加航班至 12 班/小时',
    confidence: 85,
    metrics: {
      congestionReduction: '↓ 28%',
      queueReduction: '↓ 950辆',
      effectTime: '30-40分钟'
    },
    relatedElements: ['problem-port-001'],
    reasoning: '协调海事部门增加航班频次，提升港口放行速度，预计 30-40 分钟见效'
  },
  {
    id: 'strategy-3',
    name: '城区主干道信号优化',
    confidence: 78,
    metrics: {
      congestionReduction: '↓ 18%',
      queueReduction: '↓ 600辆',
      effectTime: '5-10分钟'
    },
    relatedElements: ['problem-road-002'],
    reasoning: '优化城区主干道信号灯配时，提升通行效率，预计 5-10 分钟见效'
  }
];

export default function StrategyRecommendationPanel({ selectedElementId }: StrategyRecommendationPanelProps) {
  return (
    <div className="strategy-recommendation-panel">
      <div className="strategy-panel-header">
        <h3>AI 策略建议</h3>
        <span className="strategy-panel-badge">Top 3</span>
      </div>

      <div className="strategy-list">
        {mockStrategies.map((strategy, index) => {
          const isHighlighted = selectedElementId
            ? strategy.relatedElements.includes(selectedElementId)
            : false;

          return (
            <div
              key={strategy.id}
              className={`strategy-card${isHighlighted ? ' strategy-card--highlighted' : ''}`}
            >
              <div className="strategy-card__header">
                <div className="strategy-card__rank">#{index + 1}</div>
                <div className="strategy-card__title">
                  <h4>{strategy.name}</h4>
                  <span className="strategy-card__confidence">置信度 {strategy.confidence}%</span>
                </div>
              </div>

              <div className="strategy-card__metrics">
                <div className="strategy-metric">
                  <TrendingDown size={14} />
                  <span>拥堵下降</span>
                  <strong>{strategy.metrics.congestionReduction}</strong>
                </div>
                <div className="strategy-metric">
                  <Target size={14} />
                  <span>排队缩短</span>
                  <strong>{strategy.metrics.queueReduction}</strong>
                </div>
                <div className="strategy-metric">
                  <Clock size={14} />
                  <span>见效时间</span>
                  <strong>{strategy.metrics.effectTime}</strong>
                </div>
              </div>

              <div className="strategy-card__reasoning">
                <p>{strategy.reasoning}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
