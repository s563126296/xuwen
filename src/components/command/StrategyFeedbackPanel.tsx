import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, X } from 'lucide-react';
import { useCommandStore } from '../../stores/commandStore';

export default function StrategyFeedbackPanel() {
  const monitorState = useCommandStore((s) => s.commandState.monitorState);
  const setStrategyFeedback = useCommandStore((s) => s.setStrategyFeedback);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;
  if (monitorState.isMonitoring) return null;
  if (monitorState.feedback) return null;
  if (monitorState.curveData.length === 0) return null;

  const elapsedMin = Math.round(
    (monitorState.curveData[monitorState.curveData.length - 1]?.timestamp - monitorState.monitorStartTime) / 60000
  );
  const finalIndex = monitorState.curveData[monitorState.curveData.length - 1]?.actual ?? 0;
  const deviationCount = monitorState.curveData.filter((p) => {
    const diff = Math.abs((p.actual - p.expected) / p.expected) * 100;
    return diff > 10;
  }).length;

  const handleRate = (rating: 'effective' | 'ineffective') => {
    setStrategyFeedback({ rating, comment: comment || '', timestamp: Date.now() });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
      <div style={{ width: 380, background: '#0D1137', border: '1px solid rgba(0, 208, 233, 0.3)', borderRadius: 12, padding: 24, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ color: '#E2E8F0', fontSize: 14, fontWeight: 600 }}>策略执行评价</span>
          <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={16} color="#94A3B8" />
          </button>
        </div>

        <div style={{ background: 'rgba(0, 208, 233, 0.05)', border: '1px solid rgba(0, 208, 233, 0.15)', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 12, color: '#C9CDD4', lineHeight: 1.8 }}>
          执行时长：{elapsedMin} 分钟<br />
          最终拥堵指数：{finalIndex.toFixed(1)}<br />
          偏差告警次数：{deviationCount} 次
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button onClick={() => handleRate('effective')} style={{ flex: 1, padding: '12px 0', background: 'rgba(46, 213, 115, 0.1)', border: '1px solid rgba(46, 213, 115, 0.3)', borderRadius: 8, color: '#2ED573', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <ThumbsUp size={16} /> 建议有效
          </button>
          <button onClick={() => handleRate('ineffective')} style={{ flex: 1, padding: '12px 0', background: 'rgba(255, 71, 87, 0.1)', border: '1px solid rgba(255, 71, 87, 0.3)', borderRadius: 8, color: '#FF4757', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <ThumbsDown size={16} /> 建议无效
          </button>
        </div>

        <button onClick={() => setShowComment(!showComment)} style={{ width: '100%', padding: '8px 0', background: 'none', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 6, color: '#94A3B8', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <MessageCircle size={14} /> 补充说明
        </button>

        {showComment && (
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="请输入补充说明..." style={{ width: '100%', marginTop: 8, padding: 10, background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 6, color: '#E0E8FF', fontSize: 12, resize: 'vertical', minHeight: 60, outline: 'none', boxSizing: 'border-box' }} />
        )}

        <button onClick={() => setDismissed(true)} style={{ width: '100%', marginTop: 12, padding: '8px 0', background: 'none', border: 'none', color: '#64748B', fontSize: 11, cursor: 'pointer' }}>
          跳过
        </button>
      </div>
    </div>
  );
}
