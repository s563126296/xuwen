import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  Database,
  Radio,
  Route,
  ShieldCheck,
  ShipWheel,
  XCircle,
} from 'lucide-react';
import { useAIAnalysisStore } from '../../stores';

export default function AIStatusBar() {
  const aiStatus = useAIAnalysisStore((s) => s.aiStatus);
  const aiTask = useAIAnalysisStore((s) => s.aiTask);
  const aiConfidence = useAIAnalysisStore((s) => s.aiConfidence);
  const dataFusion = useAIAnalysisStore((s) => s.dataFusion);
  const lastUpdate = useAIAnalysisStore((s) => s.lastUpdate);
  const currentState = useAIAnalysisStore((s) => s.currentState);
  const riskScore = useAIAnalysisStore((s) => s.riskScore);
  const topRecommendation = useAIAnalysisStore((s) => s.topRecommendation);

  const statusConfig = {
    running: { icon: Activity, label: '运行中', color: '#4DA6FF' },
    completed: { icon: CheckCircle2, label: '已完成', color: '#34D399' },
    error: { icon: XCircle, label: '错误', color: '#F87171' },
  };

  const config = statusConfig[aiStatus];
  const StatusIcon = config.icon;

  const dataSources = [
    { key: 'traffic' as const, label: '交管流量' },
    { key: 'weather' as const, label: '天气海况' },
    { key: 'port' as const, label: '港口调度' },
    { key: 'video' as const, label: '视频事件' },
    { key: 'history' as const, label: '历史样本' },
    { key: 'prediction' as const, label: '预测模型' },
  ];

  const dataSourceCount = Object.values(dataFusion).filter(Boolean).length;
  const snapshotMetrics = [
    {
      label: '港口待渡压力',
      value: currentState.portQueue.toLocaleString('zh-CN'),
      unit: '辆',
      trend: '较30分钟前 +14%',
      icon: ShipWheel,
      tone: 'warning',
    },
    {
      label: '进港通道指数',
      value: currentState.congestionIndex.toFixed(2),
      unit: '/3',
      trend: '45分钟后峰值2.45',
      icon: Route,
      tone: 'danger',
    },
    {
      label: 'AI策略置信度',
      value: aiConfidence.toString(),
      unit: '%',
      trend: topRecommendation.title,
      icon: BrainCircuit,
      tone: 'primary',
    },
    {
      label: '综合风险热度',
      value: riskScore.toString(),
      unit: '',
      trend: '港口向城区传导',
      icon: Activity,
      tone: 'success',
    },
  ];

  return (
    <div className="ai-status-bar">
      <div className="ai-status-bar__top">
        <div className="ai-status-bar__identity">
          <div className="ai-status-bar__core">
            <BrainCircuit size={18} />
          </div>
          <div>
            <div className="ai-status-bar__status">
              <StatusIcon size={15} style={{ color: config.color }} />
              <span style={{ color: config.color }}>{config.label}</span>
              <strong>AI分析驾驶舱</strong>
            </div>
            <span className="ai-status-bar__task">{aiTask}</span>
          </div>
        </div>

        <div className="ai-status-bar__sources">
          {dataSources.map((source) => (
            <span
              key={source.key}
              className={`ai-status-source ${dataFusion[source.key] ? 'is-online' : 'is-offline'}`}
            >
              {source.label}
            </span>
          ))}
        </div>

        <div className="ai-status-bar__metrics">
          <div className="ai-status-bar__metric">
            <ShieldCheck size={14} />
            <span>置信度</span>
            <strong>{aiConfidence}%</strong>
          </div>

          <div className="ai-status-bar__metric">
            <Database size={14} />
            <span>数据融合</span>
            <strong>{dataSourceCount}/7</strong>
          </div>

          <div className="ai-status-bar__metric">
            <Radio size={14} />
            <span>更新时间</span>
            <strong>{lastUpdate}</strong>
          </div>
        </div>
      </div>

      <div className="ai-status-bar__snapshot" aria-label="AI分析关键指标">
        {snapshotMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className={`ai-command-metric ai-command-metric--${metric.tone}`}>
              <div className="ai-command-metric__icon">
                <Icon size={17} />
              </div>
              <div className="ai-command-metric__content">
                <span>{metric.label}</span>
                <strong>
                  {metric.value}
                  <em>{metric.unit}</em>
                </strong>
                <small>{metric.trend}</small>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
