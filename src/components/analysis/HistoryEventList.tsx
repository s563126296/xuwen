import { Clock, MapPin, AlertCircle } from 'lucide-react';
import { useAnalysisStore } from '../../stores';
import { filterEvents } from '../../utils/analysisMockData';
import type { HistoryEventSeverity } from '../../stores';

const SEVERITY_COLORS: Record<HistoryEventSeverity, string> = {
  critical: '#FF4757',
  major: '#F5A623',
  minor: '#00D0E9',
  info: '#64748B',
};

const TYPE_LABELS: Record<string, string> = {
  congestion: '拥堵',
  typhoon: '台风',
  fog: '大雾',
  spring_rush: '春运',
  accident: '事故',
  normal: '日常',
};

export default function HistoryEventList() {
  const analysisState = useAnalysisStore((s) => s.analysisState);
  const selectAnalysisEvent = useAnalysisStore((s) => s.selectAnalysisEvent);
  const { filters, selectedEventId } = analysisState;
  const filteredEvents = filterEvents(analysisState.events, filters) as typeof analysisState.events;

  return (
    <div style={{
      flex: 1,
      minHeight: 0,
      background: 'rgba(13,27,42,0.8)',
      border: '1px solid rgba(139,92,246,0.2)',
      borderRadius: 8,
      backdropFilter: 'blur(10px)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{ flexShrink: 0, padding: 16, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={14} color="#8B5CF6" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>历史事件</span>
          <span style={{ fontSize: 11, color: '#64748B' }}>({filteredEvents.length})</span>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px 16px 12px 8px' }}>
        {filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B', fontSize: 12 }}>
            <AlertCircle size={24} style={{ margin: '0 auto 8px' }} />
            <div>暂无符合条件的事件</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredEvents.map(event => {
              const isSelected = event.id === selectedEventId;
              return (
                <div key={event.id} onClick={() => selectAnalysisEvent(event.id)} style={{
                  padding: 10,
                  background: isSelected ? 'rgba(139,92,246,0.15)' : 'rgba(0,0,0,0.2)',
                  border: `1px solid ${isSelected ? '#8B5CF6' : 'rgba(255,255,255,0.05)'}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 3, height: 16, background: SEVERITY_COLORS[event.severity], borderRadius: 2, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', marginBottom: 4 }}>{event.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, padding: '2px 6px', background: 'rgba(139,92,246,0.2)', color: '#8B5CF6', borderRadius: 3 }}>
                          {TYPE_LABELS[event.type]}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MapPin size={9} color="#64748B" />
                          <span style={{ fontSize: 10, color: '#64748B' }}>{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: '#A0A8B4', marginLeft: 11 }}>
                    {event.startTime.slice(0, 16).replace('T', ' ')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
