import { Activity, CheckCircle2, Database, XCircle } from 'lucide-react';
import { useAIAnalysisStore } from '../../stores';

export default function AIStatusBar() {
  const aiStatus = useAIAnalysisStore((s) => s.aiStatus);
  const aiTask = useAIAnalysisStore((s) => s.aiTask);
  const aiConfidence = useAIAnalysisStore((s) => s.aiConfidence);
  const dataFusion = useAIAnalysisStore((s) => s.dataFusion);
  const lastUpdate = useAIAnalysisStore((s) => s.lastUpdate);

  const statusConfig = {
    running: { icon: Activity, label: '运行中', color: '#4DA6FF' },
    completed: { icon: CheckCircle2, label: '已完成', color: '#34D399' },
    error: { icon: XCircle, label: '错误', color: '#F87171' },
  };

  const config = statusConfig[aiStatus];
  const StatusIcon = config.icon;

  const dataSourceCount = Object.values(dataFusion).filter(Boolean).length;

  return (
    <div className="ai-status-bar">
      <div className="ai-status-bar__status">
        <StatusIcon size={16} style={{ color: config.color }} />
        <span style={{ color: config.color }}>{config.label}</span>
        <span className="ai-status-bar__task">{aiTask}</span>
      </div>

      <div className="ai-status-bar__metrics">
        <div className="ai-status-bar__metric">
          <span>置信度</span>
          <strong>{aiConfidence}%</strong>
        </div>

        <div className="ai-status-bar__metric">
          <Database size={14} />
          <span>数据融合</span>
          <strong>{dataSourceCount}/7</strong>
        </div>

        <div className="ai-status-bar__metric">
          <span>更新时间</span>
          <strong>{lastUpdate}</strong>
        </div>
      </div>
    </div>
  );
}
