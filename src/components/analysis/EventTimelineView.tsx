import { Clock, MapPin, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAnalysisStore } from '../../stores';
import type { HistoryEventSeverity } from '../../stores';

const SEVERITY_COLORS: Record<HistoryEventSeverity, string> = {
  critical: '#FF4757', major: '#F5A623', minor: '#00D0E9', info: '#64748B',
};
const SEVERITY_LABELS: Record<HistoryEventSeverity, string> = {
  critical: '严重', major: '重大', minor: '一般', info: '信息',
};
const TYPE_LABELS: Record<string, string> = {
  congestion: '拥堵事件', typhoon: '台风停航', fog: '大雾停航', spring_rush: '春运高峰', accident: '交通事故', normal: '日常运行',
};

export default function EventTimelineView() {
  const analysisState = useAnalysisStore((s) => s.analysisState);
  const selectAnalysisEvent = useAnalysisStore((s) => s.selectAnalysisEvent);
  const { selectedEventId, events, strategyRecords } = analysisState;
  const event = events.find(e => e.id === selectedEventId);

  if (!event) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748B' }}>
        <Clock size={32} style={{ margin: '0 auto 12px' }} />
        <div style={{ fontSize: 14, marginBottom: 4 }}>请从左侧选择一个事件</div>
        <div style={{ fontSize: 11 }}>点击历史事件卡片查看完整时间线</div>
      </div>
    );
  }

  const relatedRecords = strategyRecords.filter(r => r.eventId === event.id);

  return (
    <div>
      <button onClick={() => selectAnalysisEvent(null)} style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: 'none', border: 'none',
        cursor: 'pointer', color: '#8B5CF6', fontSize: 11, marginBottom: 12,
      }}>
        <ArrowLeft size={12} /> 返回
      </button>

      {/* Event header */}
      <div style={{ padding: 16, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 4, height: 24, background: SEVERITY_COLORS[event.severity], borderRadius: 2 }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#E2E8F0', margin: 0 }}>{event.name}</h3>
          <span style={{ fontSize: 10, padding: '2px 8px', background: `${SEVERITY_COLORS[event.severity]}20`, color: SEVERITY_COLORS[event.severity], borderRadius: 4 }}>
            {SEVERITY_LABELS[event.severity]}
          </span>
          <span style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(139,92,246,0.2)', color: '#8B5CF6', borderRadius: 4 }}>
            {TYPE_LABELS[event.type]}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#A0A8B4' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} />{event.location}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} />{event.startTime.slice(0, 16).replace('T', ' ')}</span>
          {event.responseLevel && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={10} />{event.responseLevel}级响应</span>}
        </div>
        <div style={{ fontSize: 12, color: '#C9CDD4', marginTop: 8, lineHeight: 1.6 }}>{event.summary}</div>
      </div>

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        <div style={{ padding: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 10, color: '#A0A8B4', marginBottom: 4 }}>峰值拥堵指数</div>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#FF4757' }}>{event.peakCongestionIndex}</span>
        </div>
        <div style={{ padding: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 10, color: '#A0A8B4', marginBottom: 4 }}>最大滞留</div>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#F5A623' }}>{event.maxStrandedVehicles}</span>
          <span style={{ fontSize: 10, color: '#64748B', marginLeft: 3 }}>辆</span>
        </div>
        <div style={{ padding: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 10, color: '#A0A8B4', marginBottom: 4 }}>策略执行</div>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#8B5CF6' }}>{relatedRecords.length}</span>
          <span style={{ fontSize: 10, color: '#64748B', marginLeft: 3 }}>次</span>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', marginBottom: 10 }}>事件时间线</div>
        <div style={{ position: 'relative', paddingLeft: 20 }}>
          <div style={{ position: 'absolute', left: 6, top: 4, bottom: 4, width: 2, background: 'rgba(139,92,246,0.3)' }} />
          {event.timeline.map((item, idx) => (
            <div key={idx} style={{ position: 'relative', marginBottom: 16 }}>
              <div style={{ position: 'absolute', left: -17, top: 4, width: 10, height: 10, borderRadius: '50%', background: '#8B5CF6', border: '2px solid rgba(13,27,42,0.8)' }} />
              <div style={{ fontSize: 11, color: '#8B5CF6', fontFamily: 'monospace', marginBottom: 2 }}>{item.time}</div>
              <div style={{ fontSize: 12, color: '#E2E8F0', marginBottom: 2 }}>{item.action}</div>
              <div style={{ fontSize: 10, color: '#64748B' }}>{item.actor} · {item.result}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Related strategies */}
      {relatedRecords.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', marginBottom: 10 }}>关联策略执行</div>
          <div style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: 6, overflow: 'hidden' }}>
            {relatedRecords.map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: 11 }}>
                <span style={{ color: '#8B5CF6', fontFamily: 'monospace', width: 40 }}>{r.strategyId}</span>
                <span style={{ color: '#E2E8F0', flex: 1 }}>{r.strategyName}</span>
                <span style={{ color: '#FF4757' }}>{r.preIndex}</span>
                <span style={{ color: '#64748B' }}>→</span>
                <span style={{ color: '#2ED573' }}>{r.postIndex}</span>
                <span style={{ color: '#00D0E9', width: 50, textAlign: 'right' }}>{r.reliefMinutes}分钟</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
