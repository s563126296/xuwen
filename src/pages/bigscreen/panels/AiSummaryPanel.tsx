import PanelFrame from '../components/PanelFrame';
import { useOverviewStore } from '../../../stores/overviewStore';

const levelColorMap: Record<string, string> = {
  green: '#00ffa2',
  yellow: '#ffc107',
  orange: '#ff8c00',
  red: '#ff4757',
};

const priorityLabelMap: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

export default function AiSummaryPanel() {
  const aiSummary = useOverviewStore((s) => s.aiSummary);
  const dotColor = levelColorMap[aiSummary.level] || '#00ffa2';
  const shouldAnimate = aiSummary.level === 'orange' || aiSummary.level === 'red';
  const firstAction = aiSummary.actions[0];

  return (
    <PanelFrame title="AI 态势研判">
      {/* Level dot + conclusion */}
      <div className="bs-flex bs-items-center bs-gap-8" style={{ marginBottom: 10 }}>
        <span style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: dotColor,
          boxShadow: `0 0 8px ${dotColor}`,
          flexShrink: 0,
          animation: shouldAnimate ? 'breathe 2s ease-in-out infinite' : 'none',
        }} />
        <span style={{
          fontSize: 16,
          fontWeight: 700,
          color: dotColor,
          textShadow: `0 0 10px ${dotColor}55`,
        }}>
          {aiSummary.conclusion}
        </span>
      </div>

      {/* 3 key metrics */}
      <div className="bs-flex bs-gap-8" style={{ marginBottom: 10 }}>
        {aiSummary.metrics.slice(0, 3).map((m, i) => (
          <div key={i} style={{
            flex: 1,
            textAlign: 'center',
            padding: '6px 0',
            background: 'rgba(0,240,255,0.04)',
            borderRadius: 6,
            border: '1px solid rgba(0,240,255,0.1)',
          }}>
            <div style={{
              fontFamily: 'DIN Alternate, monospace',
              fontSize: 16,
              fontWeight: 700,
              color: m.color,
            }}>
              {m.value}
            </div>
            <div className="bs-text-xs bs-text-secondary">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Suggestion action */}
      {firstAction && (
        <div style={{
          padding: '8px 12px',
          background: 'rgba(255,138,53,0.08)',
          border: '1px solid rgba(255,138,53,0.2)',
          borderRadius: 6,
        }}>
          <div className="bs-flex bs-items-center bs-gap-8">
            <span style={{
              fontSize: 10,
              padding: '1px 6px',
              borderRadius: 3,
              background: firstAction.priority === 'high' ? 'rgba(255,71,87,0.2)' : 'rgba(0,240,255,0.08)',
              color: firstAction.priority === 'high' ? '#ff4757' : 'var(--bs-cyan)',
              border: `1px solid ${firstAction.priority === 'high' ? 'rgba(255,71,87,0.3)' : 'rgba(0,240,255,0.2)'}`,
            }}>
              {priorityLabelMap[firstAction.priority] || firstAction.priority}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--bs-text-primary)' }}>
              {firstAction.title}
            </span>
          </div>
          <div className="bs-text-xs bs-text-secondary" style={{ marginTop: 4 }}>
            {firstAction.description}
          </div>
        </div>
      )}
    </PanelFrame>
  );
}
